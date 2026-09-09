import { exec } from 'child_process';
import { promisify } from 'util';
import { DiscoveredPrinter, HostPrinterConnection, HostPrinterStatus } from '../types.js';

const execAsync = promisify(exec);

/**
 * Checks if a printer is a virtual / software printer that must be ignored.
 */
export function isVirtualPrinter(name: string, driver: string, port: string): boolean {
  const n = (name || '').toUpperCase();
  const d = (driver || '').toUpperCase();
  const p = (port || '').toUpperCase();

  // 1. Known virtual names and keywords
  const virtualKeywords = [
    'MICROSOFT PRINT TO PDF',
    'MICROSOFT XPS DOCUMENT WRITER',
    'ONENOTE',
    'FAX',
    'ADOBE PDF',
    'PDF CREATOR',
    'PDFCREATOR',
    'CUTEPDF',
    'BULLZIP',
    'FOXIT',
    'PRIMOPDF',
    'DOPDF',
    'NITRO',
    'NOVAPDF',
    'PDF24',
    'VIRTUAL PRINTER',
    'PRINT TO PDF',
    'DOCUMENT WRITER',
    'SEND TO MICROSOFT',
    'ROOT PRINT QUEUE'
  ];

  for (const kw of virtualKeywords) {
    if (n.includes(kw) || d.includes(kw)) {
      return true;
    }
  }

  // 2. Known virtual port names
  if (
    p.startsWith('PORTPROMPT') ||
    p === 'NUL:' ||
    p === 'FILE:' ||
    p.includes('ONENOTEVIRTUAL') ||
    p.includes('PDF') ||
    p.includes('XPS')
  ) {
    return true;
  }

  // 3. Virtual driver indicators
  if (d.includes('VIRTUAL PRINT') || d.includes('GENERIC / TEXT ONLY') || d.includes('REMOTE DESKTOP EASY PRINT')) {
    return true;
  }

  return false;
}

/**
 * Determines genuine connection type from the OS port name
 */
export function inferConnectionType(portName: string): HostPrinterConnection {
  const p = (portName || '').toUpperCase();
  if (p.includes('USB') || p.includes('DOT4') || p.startsWith('USB')) return 'USB';
  if (p.includes('BTH') || p.includes('BLUETOOTH')) return 'Bluetooth';
  if (p.includes('WSD') || p.includes('WIFI') || p.includes('WIRELESS')) return 'Wi-Fi';
  if (p.includes('IP_') || p.includes('192.168') || p.includes('10.') || p.includes('172.') || p.includes('LAN') || p.includes('NET') || p.includes('PORT')) return 'Ethernet';
  if (p.startsWith('\\\\')) return 'Shared Printer';
  return 'Unknown';
}

/**
 * Infers brand from physical printer name or driver
 */
export function inferBrand(name: string, driver: string): DiscoveredPrinter['brand'] {
  const full = `${name} ${driver}`.toUpperCase();
  if (full.includes('HP') || full.includes('HEWLETT') || full.includes('DESKJET') || full.includes('LASERJET')) return 'HP';
  if (full.includes('EPSON') || full.includes('ECOTANK')) return 'Epson';
  if (full.includes('CANON') || full.includes('PIXMA') || full.includes('IMAGECLASS')) return 'Canon';
  if (full.includes('BROTHER') || full.includes('HL-') || full.includes('DCP-')) return 'Brother';
  if (full.includes('RICOH')) return 'Ricoh';
  if (full.includes('KYOCERA') || full.includes('TASKALFA')) return 'Kyocera';
  if (full.includes('SAMSUNG')) return 'Samsung';
  if (full.includes('XEROX')) return 'Xerox';
  if (full.includes('PANTUM')) return 'Pantum';
  if (full.includes('ZEBRA')) return 'Zebra';
  if (full.includes('TVS')) return 'TVS';
  return 'Generic';
}

/**
 * Maps Windows spooler PrinterStatus / PrinterState to standard status
 */
export function mapWindowsStatus(rawStatus: number, workOffline: boolean): HostPrinterStatus {
  if (workOffline) return 'Offline';

  // Windows Win32_Printer PrinterStatus / PrinterState mapping
  switch (rawStatus) {
    case 3: // Idle / Ready in Win32
    case 0:
      return 'Ready';
    case 4: // Printing
      return 'Printing';
    case 5: // Warmup
      return 'Ready';
    case 1: // Other / Paused
      return 'Paused';
    case 2: // Unknown / Offline
    case 7: // Offline
      return 'Offline';
    case 8: // Paper Jam
      return 'Paper Jam';
    case 9: // Out of Paper
      return 'Out of Paper';
    case 10: // Door Open
      return 'Door Open';
    case 11: // Low Toner
      return 'Low Toner';
    case 12: // Error
    case 6: // Stopped / Error
      return 'Error';
    default:
      return 'Ready';
  }
}

/**
 * Detects ONLY real physical Windows OS printers using PowerShell / WMI
 */
export async function detectWindowsPrinters(): Promise<DiscoveredPrinter[]> {
  try {
    // Query Win32_Printer via PowerShell
    const psCommand = `powershell -NoProfile -Command "Get-CimInstance Win32_Printer | Select-Object Name,DriverName,PortName,PrinterStatus,PrinterState,WorkOffline,Default,Local,Network,Shared | ConvertTo-Json -Compress"`;
    
    const { stdout } = await execAsync(psCommand, { timeout: 8000 });
    const trimmed = stdout.trim();

    if (!trimmed) {
      return [];
    }

    let parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      parsed = [parsed];
    }

    const physicalPrinters: DiscoveredPrinter[] = [];

    for (const item of parsed) {
      const name = String(item.Name || '').trim();
      const driver = String(item.DriverName || '').trim();
      const port = String(item.PortName || '').trim();

      // STRICT FILTER: Ignore every virtual / software printer
      if (isVirtualPrinter(name, driver, port)) {
        continue;
      }

      const connectionType = inferConnectionType(port);
      const brand = inferBrand(name, driver);
      const isDefault = Boolean(item.Default);
      const workOffline = Boolean(item.WorkOffline);
      const rawStatus = item.PrinterStatus ?? 3;
      const status = mapWindowsStatus(rawStatus, workOffline);
      const isColor = name.toLowerCase().includes('color') || driver.toLowerCase().includes('color');

      physicalPrinters.push({
        id: `prn-win-${Buffer.from(name).toString('base64url').slice(0, 16)}`,
        name,
        driver: driver || 'Standard OS Driver',
        port: port || 'USB',
        brand,
        model: driver || name,
        connectionType,
        status,
        isDefault,
        isColor,
        isDuplexSupported: true,
        isAutoCutSupported: name.toLowerCase().includes('pos') || name.toLowerCase().includes('thermal'),
        paperLevel: null, // Never fabricate - only from driver telemetry
        inkLevels: null,  // Never fabricate
        capabilities: {
          paperSizes: ['A4', 'Letter'],
          isColor,
          isDuplex: true
        },
        rawDetails: item
      });
    }

    return physicalPrinters;
  } catch (err) {
    console.warn('Windows physical printer detection error:', err);
    return [];
  }
}

import crypto from 'crypto';
import { Printer, ConnectionType } from './types';
import { mapPrinterStatus } from './printerStatus';
import { extractIpFromPort, resolveMacForIp } from './networkPrinter';
import { env } from '../config/env';

export interface RawPrinterData {
  Name: string;
  DeviceID?: string;
  DriverName?: string;
  PortName?: string;
  Location?: string;
  Comment?: string;
  Default?: boolean;
  Network?: boolean;
  Shared?: boolean;
  ShareName?: string;
  PrinterStatus?: number;
  ExtendedPrinterStatus?: number;
  DetectedErrorState?: number;
  WorkOffline?: boolean;
  PrinterState?: number;
  HorizontalResolution?: number;
  VerticalResolution?: number;
  CapabilityDescriptions?: string[];
  PaperSizesSupported?: number[];
  Direct?: boolean;
  QueuedJobs?: number;
  HostAddress?: string;
  SerialNumber?: string;
}

const VIRTUAL_PRINTER_NAMES = [
  'microsoft print to pdf',
  'microsoft xps document writer',
  'microsoft xps',
  'fax',
  'onenote',
  'onenote (desktop)',
  'onenote for windows 10',
  'send to onenote',
  'send to microsoft onenote'
];

/**
 * Checks if a printer is a virtual Windows printer.
 */
export function isVirtualPrinter(printerName: string): boolean {
  const normalized = printerName.toLowerCase().trim();
  return VIRTUAL_PRINTER_NAMES.some((v) => normalized.includes(v));
}

/**
 * Determines connection type from Windows port and network attributes.
 */
export function determineConnectionType(portName?: string, isNetwork?: boolean, isShared?: boolean): ConnectionType {
  if (!portName) {
    return isNetwork ? 'NETWORK' : 'LOCAL';
  }

  const upperPort = portName.toUpperCase();

  // Bluetooth
  if (upperPort.startsWith('BTH') || upperPort.includes('BLUETOOTH')) {
    return 'BLUETOOTH';
  }

  // Wireless / Wi-Fi Direct / WSD over Wi-Fi
  if (upperPort.includes('WIFI') || upperPort.includes('WIRELESS') || upperPort.includes('DIRECT-')) {
    return 'WIRELESS';
  }

  // USB
  if (upperPort.startsWith('USB') || upperPort.startsWith('DOT4') || upperPort.includes('USB')) {
    return 'USB';
  }

  // Shared Printer (e.g. \\server\printer)
  if (isShared || upperPort.startsWith('\\\\') || portName.startsWith('\\\\')) {
    return 'SHARED';
  }

  // Network TCP/IP or WSD
  if (
    isNetwork ||
    upperPort.startsWith('IP_') ||
    upperPort.startsWith('WSD') ||
    upperPort.includes('9100') ||
    /^(?:\d{1,3}\.){3}\d{1,3}/.test(portName)
  ) {
    return 'NETWORK';
  }

  // Local ports (LPT, COM, FILE, nul, etc.)
  if (upperPort.startsWith('LPT') || upperPort.startsWith('COM') || upperPort.startsWith('FILE') || upperPort.startsWith('PORTPROMPT') || upperPort === 'NUL:') {
    return 'LOCAL';
  }

  return 'LOCAL';
}

/**
 * Infers manufacturer and model heuristics from printer name and driver name.
 */
export function parseManufacturerAndModel(name: string, driverName?: string): { manufacturer: string; model: string } {
  const combined = `${name} ${driverName || ''}`.trim();
  const knownManufacturers = [
    'HP', 'Hewlett-Packard', 'Canon', 'Epson', 'Brother', 'Xerox', 'Samsung',
    'Ricoh', 'Kyocera', 'Lexmark', 'Zebra', 'DNP', 'Fujitsu', 'Konica Minolta',
    'Toshiba', 'Citizen', 'TSC', 'Star Micronics', 'POSBANK', 'Bixolon', 'Microsoft'
  ];

  let foundManufacturer = 'Generic';
  for (const mfg of knownManufacturers) {
    const regex = new RegExp(`\\b${mfg}\\b`, 'i');
    if (regex.test(combined)) {
      foundManufacturer = mfg === 'Hewlett-Packard' ? 'HP' : mfg;
      break;
    }
  }

  // Model cleanup: remove manufacturer name from printer name
  let model = name;
  if (foundManufacturer !== 'Generic') {
    model = model.replace(new RegExp(`^${foundManufacturer}\\s*`, 'i'), '').trim();
  }

  return {
    manufacturer: foundManufacturer,
    model: model || name
  };
}

/**
 * Maps Windows PaperSizesSupported IDs to human-readable names.
 */
export function mapPaperSizes(codes?: number[]): string[] {
  if (!codes || !Array.isArray(codes) || codes.length === 0) {
    return ['A4', 'Letter'];
  }

  const paperMap: Record<number, string> = {
    1: 'Letter',
    2: 'Letter Small',
    3: 'Tabloid',
    4: 'Ledger',
    5: 'Legal',
    6: 'Statement',
    7: 'Executive',
    8: 'A3',
    9: 'A4',
    10: 'A4 Small',
    11: 'A5',
    12: 'B4 (JIS)',
    13: 'B5 (JIS)',
    14: 'Folio',
    15: 'Quarto',
    16: '10x14',
    17: '11x17',
    20: 'Envelope #9',
    21: 'Envelope #10',
    22: 'Envelope #11',
    23: 'Envelope #12',
    24: 'Envelope #14',
    25: 'C Sheet',
    26: 'D Sheet',
    27: 'E Sheet',
    28: 'Envelope DL',
    29: 'Envelope C5',
    30: 'Envelope C3',
    31: 'Envelope C4',
    32: 'Envelope C6',
    54: 'A4 Plus',
    55: 'A5 Plus'
  };

  const sizes = new Set<string>();
  for (const code of codes) {
    if (paperMap[code]) {
      sizes.add(paperMap[code]);
    }
  }

  if (sizes.size === 0) {
    sizes.add('A4');
    sizes.add('Letter');
  }

  return Array.from(sizes);
}

/**
 * Creates a unique deterministic ID for a printer.
 */
export function generatePrinterId(name: string, portName?: string, deviceId?: string): string {
  const seed = `${name.toLowerCase().trim()}_${(portName || '').toLowerCase().trim()}_${(deviceId || '').toLowerCase().trim()}`;
  const hash = crypto.createHash('sha256').update(seed).digest('hex').substring(0, 12);
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 16);
  return `prn_${cleanName}_${hash}`;
}

/**
 * Converts raw Windows WMI/CIM printer data into standard Printer interface.
 */
export async function mapRawToPrinter(raw: RawPrinterData): Promise<Printer | null> {
  if (!raw || !raw.Name) return null;

  // Filter virtual printers unless explicitly allowed
  if (!env.INCLUDE_VIRTUAL_PRINTERS && isVirtualPrinter(raw.Name)) {
    return null;
  }

  const { status, isOnline } = mapPrinterStatus(raw);
  const connectionType = determineConnectionType(raw.PortName, raw.Network, raw.Shared);
  const { manufacturer, model } = parseManufacturerAndModel(raw.Name, raw.DriverName);
  const id = generatePrinterId(raw.Name, raw.PortName, raw.DeviceID);

  const capabilities = Array.isArray(raw.CapabilityDescriptions) ? raw.CapabilityDescriptions : [];
  const colorSupport = capabilities.some((c) => /color/i.test(c));
  const duplexSupport = capabilities.some((c) => /duplex|two-sided/i.test(c));

  const ipAddress = extractIpFromPort(raw.PortName || '', raw.HostAddress);
  const mac = await resolveMacForIp(ipAddress);

  const hRes = raw.HorizontalResolution || 600;
  const vRes = raw.VerticalResolution || 600;
  const resolution = `${hRes}x${vRes} DPI`;

  return {
    id,
    name: raw.Name,
    driverName: raw.DriverName || 'Generic Printer Driver',
    portName: raw.PortName || 'UNKNOWN',
    location: raw.Location || '',
    comment: raw.Comment || '',
    manufacturer,
    model,
    isDefault: Boolean(raw.Default),
    isNetwork: Boolean(raw.Network) || connectionType === 'NETWORK' || connectionType === 'WIRELESS',
    isShared: Boolean(raw.Shared) || connectionType === 'SHARED',
    shareName: raw.ShareName || '',
    status,
    isOnline,
    jobsWaiting: raw.QueuedJobs || 0,
    colorSupport,
    duplexSupport,
    paperSizes: mapPaperSizes(raw.PaperSizesSupported),
    trayList: ['Auto Select', 'Tray 1', 'Manual Feed'],
    resolution,
    capabilities: capabilities.length > 0 ? capabilities : ['COPIES', colorSupport ? 'COLOR' : 'MONOCHROME'],
    connectionType,
    ipAddress,
    mac,
    serialNumber: raw.SerialNumber || null,
    lastSeen: new Date().toISOString()
  };
}

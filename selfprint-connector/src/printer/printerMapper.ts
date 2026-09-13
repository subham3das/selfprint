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
  'xps document writer',
  'fax',
  'onenote',
  'onenote (desktop)',
  'onenote for windows 10',
  'send to onenote',
  'send to microsoft onenote',
  'adobe pdf',
  'cutepdf',
  'foxit',
  'foxit reader',
  'foxit phantom',
  'bullzip',
  'nitro pdf',
  'primopdf',
  'pdfcreator',
  'dopdf',
  'novapdf',
  'pdf24',
  'wondershare pdf',
  'virtual printer',
  'pdf printer',
  'print to file'
];

/**
 * Checks if a printer is a virtual Windows device, software converter, or redirected session.
 */
export function isVirtualPrinter(printerName: string, driverName?: string, portName?: string): boolean {
  const name = (printerName || '').toLowerCase().trim();
  const driver = (driverName || '').toLowerCase().trim();
  const port = (portName || '').toLowerCase().trim();

  // 1. Virtual printer names / software writer signatures
  if (VIRTUAL_PRINTER_NAMES.some((v) => name.includes(v))) {
    return true;
  }

  // 2. Remote Desktop / Terminal Services redirected printers (e.g., "HP LaserJet (redirected 1)")
  if (name.includes('redirected') || name.includes('session ') || port.startsWith('ts') || port.startsWith('rdp')) {
    return true;
  }

  // 3. Virtual file-sink ports (FILE:, PORTPROMPT:, NUL:)
  if (
    port.startsWith('portprompt') ||
    port.startsWith('file:') ||
    port === 'file' ||
    port.startsWith('nul:') ||
    port === 'nul'
  ) {
    return true;
  }

  // 4. Virtual driver signatures
  if (
    driver.includes('print to pdf') ||
    driver.includes('xps document writer') ||
    driver.includes('adobe pdf') ||
    driver.includes('cutepdf') ||
    driver.includes('pdf converter') ||
    driver.includes('virtual driver') ||
    driver.includes('distiller') ||
    driver.includes('pdfcreator') ||
    driver.includes('foxit')
  ) {
    return true;
  }

  return false;
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
 * Checks if a printer is a virtual Windows device allowed for Test Mode.
 */
export function isAllowedVirtualTestPrinter(printerName: string, driverName?: string): boolean {
  const name = (printerName || '').toLowerCase().trim();
  const driver = (driverName || '').toLowerCase().trim();
  return (
    name.includes('print to pdf') ||
    name.includes('xps document writer') ||
    name.includes('xps') ||
    driver.includes('print to pdf') ||
    driver.includes('xps document writer')
  );
}

/**
 * Converts raw Windows WMI/CIM printer data into standard Printer interface.
 */
export async function mapRawToPrinter(raw: RawPrinterData, testMode: boolean = false): Promise<Printer | null> {
  if (!raw || !raw.Name) return null;

  const isVirtual = isVirtualPrinter(raw.Name, raw.DriverName, raw.PortName);

  // If virtual printer, strictly filter out unless testMode is enabled and it's an allowed virtual test printer
  if (isVirtual) {
    if (!testMode || !isAllowedVirtualTestPrinter(raw.Name, raw.DriverName)) {
      return null;
    }
  }

  const { status, isOnline } = isVirtual ? { status: 'ONLINE' as const, isOnline: true } : mapPrinterStatus(raw);
  const connectionType: ConnectionType = isVirtual ? 'VIRTUAL' : determineConnectionType(raw.PortName, raw.Network, raw.Shared);
  const { manufacturer, model } = isVirtual
    ? { manufacturer: 'Microsoft', model: raw.Name.includes('XPS') ? 'Virtual XPS Document Writer' : 'Virtual PDF Printer' }
    : parseManufacturerAndModel(raw.Name, raw.DriverName);
  const id = generatePrinterId(raw.Name, raw.PortName, raw.DeviceID);

  const capabilities = isVirtual
    ? ['COPIES', 'COLOR', 'TEST_PRINTER', 'VIRTUAL', 'PDF_GENERATOR']
    : (Array.isArray(raw.CapabilityDescriptions) ? raw.CapabilityDescriptions : []);
  const colorSupport = isVirtual ? true : capabilities.some((c) => /color/i.test(c));
  const duplexSupport = isVirtual ? true : capabilities.some((c) => /duplex|two-sided/i.test(c));

  const ipAddress = isVirtual ? null : extractIpFromPort(raw.PortName || '', raw.HostAddress);
  const mac = isVirtual ? null : await resolveMacForIp(ipAddress);

  const hRes = raw.HorizontalResolution || 600;
  const vRes = raw.VerticalResolution || 600;
  const resolution = `${hRes}x${vRes} DPI`;

  return {
    id,
    name: raw.Name,
    driverName: raw.DriverName || (isVirtual ? 'Microsoft Software Printer Driver' : 'Generic Printer Driver'),
    portName: raw.PortName || (isVirtual ? 'PORTPROMPT:' : 'UNKNOWN'),
    location: isVirtual ? 'Local Virtual Device (Test Mode)' : (raw.Location || ''),
    comment: isVirtual ? 'SelfPrint Virtual Test Printer' : (raw.Comment || ''),
    manufacturer,
    model,
    isDefault: Boolean(raw.Default),
    isNetwork: isVirtual ? false : (Boolean(raw.Network) || connectionType === 'NETWORK' || connectionType === 'WIRELESS'),
    isShared: isVirtual ? false : (Boolean(raw.Shared) || connectionType === 'SHARED'),
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
    lastSeen: new Date().toISOString(),
    isVirtual: Boolean(isVirtual),
    isTestMode: Boolean(isVirtual && testMode)
  };
}

/**
 * Creates a synthetic SelfPrint Virtual Printer when Test Mode is active and no physical printer exists.
 */
export function createSelfPrintVirtualPrinter(): Printer {
  return {
    id: 'virtual_selfprint_pdf_printer',
    name: 'SelfPrint Virtual Printer',
    driverName: 'Microsoft Print to PDF',
    portName: 'PORTPROMPT:',
    location: 'Local Virtual Environment (Test Mode)',
    comment: 'SelfPrint Emulated PDF Spooler',
    manufacturer: 'SelfPrint',
    model: 'Virtual PDF Printer',
    isDefault: true,
    isNetwork: false,
    isShared: false,
    shareName: '',
    status: 'ONLINE',
    isOnline: true,
    jobsWaiting: 0,
    colorSupport: true,
    duplexSupport: true,
    paperSizes: ['A4', 'A3', 'Letter', 'Legal'],
    trayList: ['Virtual Tray 1'],
    resolution: '600x600 DPI',
    capabilities: ['COPIES', 'COLOR', 'TEST_PRINTER', 'VIRTUAL', 'PDF_GENERATOR'],
    connectionType: 'VIRTUAL',
    ipAddress: null,
    mac: null,
    serialNumber: 'VIRT-PRN-001',
    lastSeen: new Date().toISOString(),
    isVirtual: true,
    isTestMode: true
  };
}


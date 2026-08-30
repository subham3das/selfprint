import {
  DetectedPrinter,
  PrinterSetupConfig
} from '../types/printerSetup.types';

export const MOCK_DETECTED_PRINTERS: DetectedPrinter[] = [
  {
    id: 'prn-hp-1020',
    name: 'HP LaserJet 1020 Plus',
    brand: 'HP',
    model: 'LaserJet 1020 Plus Series',
    type: 'LaserJet',
    connection: 'USB',
    port: 'USB001 (HP Print Port)',
    isColor: false,
    isDuplexSupported: false,
    isAutoCutSupported: false,
    isDriverInstalled: true,
    paperLevel: 88,
    inkLevels: {
      black: 82
    },
    status: 'Online',
    firmwareVersion: 'v2024.11.02',
    serialNumber: 'CNB1293849',
    description: 'High-speed monochrome desktop laser printer. Optimal for fast black & white xerox copies.'
  },
  {
    id: 'prn-epson-l3250',
    name: 'Epson EcoTank L3250 Series',
    brand: 'Epson',
    model: 'EcoTank L3250 Wi-Fi All-in-One',
    type: 'InkJet',
    connection: 'WiFi',
    ipAddress: '192.168.1.108',
    port: '9100 (RAW JetDirect)',
    isColor: true,
    isDuplexSupported: true,
    isAutoCutSupported: false,
    isDriverInstalled: true,
    paperLevel: 75,
    inkLevels: {
      black: 90,
      cyan: 85,
      magenta: 78,
      yellow: 88
    },
    status: 'Online',
    firmwareVersion: 'v4.8.2-wifi',
    serialNumber: 'EP-99482103',
    description: 'Wireless color ink tank printer with low cost per page. Ideal for documents, certificates and color prints.'
  },
  {
    id: 'prn-canon-ir2206',
    name: 'Canon imageRUNNER 2206 MFP',
    brand: 'Canon',
    model: 'iR 2206 A3/A4 Heavy Duty',
    type: 'Multifunction',
    connection: 'LAN',
    ipAddress: '192.168.1.50',
    port: 'LPR / Port 515',
    isColor: false,
    isDuplexSupported: true,
    isAutoCutSupported: false,
    isDriverInstalled: true,
    paperLevel: 95,
    inkLevels: {
      black: 70
    },
    status: 'Online',
    firmwareVersion: 'v12.01-commercial',
    serialNumber: 'CANON-IR-00293',
    description: 'Commercial enterprise multi-tray monochrome photocopier with automatic duplexing.'
  },
  {
    id: 'prn-tvs-rp3200',
    name: 'TVS RP 3200 Plus Thermal',
    brand: 'TVS',
    model: 'RP 3200 Plus 3-inch POS',
    type: 'Thermal',
    connection: 'USB',
    port: 'USB002',
    isColor: false,
    isDuplexSupported: false,
    isAutoCutSupported: true,
    isDriverInstalled: true,
    paperLevel: 60,
    inkLevels: {
      black: 100 // Thermal does not consume ink
    },
    status: 'Online',
    firmwareVersion: 'v1.0.8',
    serialNumber: 'TVS-RP3200-9812',
    description: 'Ultra-fast 80mm POS receipt printer with auto-cutter for instant customer transaction slips.'
  }
];

export const DEFAULT_PRINTER_CONFIG: PrinterSetupConfig = {
  defaultPaper: 'A4',
  defaultQuality: 'Standard',
  defaultColorMode: 'Black & White',
  duplex: false,
  autoCut: false,
  autoSpool: true
};

export const SCANNING_MESSAGES = [
  'Searching connected printers...',
  'Checking USB ports (USB001, USB002)...',
  'Looking for local Wi-Fi & LAN network printers...',
  'Detecting Windows Spooler drivers...',
  'Verifying printer hardware compatibility...',
  'Almost done...'
];

export const CALIBRATION_STEPS = [
  { id: 1, title: 'Checking paper tray alignment', desc: 'Verifying A4 tray sensor & sheet feed' },
  { id: 2, title: 'Checking toner / ink levels', desc: 'Reading cartridge chip telemetry' },
  { id: 3, title: 'Testing printhead & spooler queue', desc: 'Ensuring zero print queue locks' },
  { id: 4, title: 'Checking printer firmware response', desc: 'Validating hardware communication latency' },
  { id: 5, title: 'Verifying bidirectional duplex communication', desc: 'Confirming print job status callbacks' },
  { id: 6, title: 'Synchronizing hardware profile with Self Print Cloud', desc: 'Enabling automatic print queue routing' }
];

export type HostOs = 'windows' | 'darwin' | 'linux';

export type HostPrinterConnection =
  | 'USB'
  | 'Wi-Fi'
  | 'Ethernet'
  | 'Bluetooth'
  | 'Shared Printer'
  | 'Unknown';

export type HostPrinterStatus =
  | 'Ready'
  | 'Printing'
  | 'Paused'
  | 'Offline'
  | 'Disconnected'
  | 'Paper Jam'
  | 'Door Open'
  | 'Out of Paper'
  | 'Low Toner'
  | 'Error'
  | 'Unknown';

export interface DiscoveredPrinter {
  id: string;
  name: string;
  driver: string;
  port: string;
  brand: 'HP' | 'Epson' | 'Canon' | 'Brother' | 'Ricoh' | 'Kyocera' | 'Samsung' | 'Xerox' | 'Pantum' | 'Zebra' | 'TVS' | 'Generic';
  model: string;
  connectionType: HostPrinterConnection;
  status: HostPrinterStatus;
  isDefault: boolean;
  isColor: boolean;
  isDuplexSupported: boolean;
  isAutoCutSupported: boolean;
  paperLevel?: number | null;
  inkLevels?: {
    black?: number | null;
    cyan?: number | null;
    magenta?: number | null;
    yellow?: number | null;
  } | null;
  capabilities: {
    paperSizes: string[];
    isColor: boolean;
    isDuplex: boolean;
  };
  rawDetails?: Record<string, any>;
}

export interface HostInfo {
  hostId: string;
  deviceName: string;
  os: HostOs;
  osRelease: string;
  hostVersion: string;
  uptime: number;
  port: number;
}

export interface CalibrationResult {
  success: boolean;
  printerId: string;
  printerName: string;
  connectionVerified: boolean;
  driverVerified: boolean;
  spoolerReady: boolean;
  responseTimeMs: number;
  message: string;
}

export interface TestPrintResult {
  success: boolean;
  jobId: string;
  printerName: string;
  message: string;
}

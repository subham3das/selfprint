export type PrinterConnection =
  | 'USB'
  | 'WiFi'
  | 'Wi-Fi'
  | 'LAN'
  | 'Ethernet'
  | 'Bluetooth'
  | 'Shared Printer'
  | 'Virtual'
  | 'Unknown';

export type PrinterType =
  | 'LaserJet'
  | 'InkJet'
  | 'Thermal'
  | 'DotMatrix'
  | 'Multifunction';

export type PrinterHealthStatus =
  | 'Ready'
  | 'Online'
  | 'Printing'
  | 'Paused'
  | 'Offline'
  | 'Disconnected'
  | 'Paper Jam'
  | 'Door Open'
  | 'Out of Paper'
  | 'Low Toner'
  | 'Warning'
  | 'Error'
  | 'Unknown';

export type PaperSize = 'A4' | 'Letter' | 'Legal' | 'Custom';
export type PrintQuality = 'Draft' | 'Standard' | 'High';
export type PrintColorMode = 'Black & White' | 'Color';

export interface DetectedPrinter {
  id: string;
  name: string;
  brand: 'HP' | 'Epson' | 'Canon' | 'Brother' | 'Ricoh' | 'Kyocera' | 'Samsung' | 'Xerox' | 'Pantum' | 'Zebra' | 'TVS' | 'Generic';
  model: string;
  type: PrinterType;
  connection: PrinterConnection;
  ipAddress?: string;
  port?: string;
  isDefault?: boolean;
  isColor: boolean;
  isDuplexSupported: boolean;
  isAutoCutSupported: boolean;
  isDriverInstalled: boolean;
  paperLevel?: number | null;
  inkLevels?: {
    black?: number | null;
    cyan?: number | null;
    magenta?: number | null;
    yellow?: number | null;
  } | null;
  status: PrinterHealthStatus;
  firmwareVersion?: string;
  serialNumber?: string;
  description?: string;
}

export interface PrinterSetupConfig {
  defaultPaper: PaperSize;
  defaultQuality: PrintQuality;
  defaultColorMode: PrintColorMode;
  duplex: boolean;
  autoCut: boolean;
  autoSpool: boolean;
}

export type PrinterWizardStep =
  | 'Welcome'
  | 'Scanning'
  | 'Selection'
  | 'Calibration'
  | 'Configuration'
  | 'TestPrint'
  | 'Success'
  | 'Error'
  | 'ManualSetup';

export type PrinterErrorType =
  | 'NoPhysicalPrinterDetected'
  | 'NoPrinterFound'
  | 'HostServiceRequired'
  | 'DriverMissing'
  | 'PrinterOffline'
  | 'PaperOut'
  | 'LowInk'
  | 'PaperJam'
  | 'PrinterBusy'
  | 'CommunicationFailed'
  | null;

export interface PrinterNotificationItem {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  actionText?: string;
}

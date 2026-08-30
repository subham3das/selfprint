export type PrinterConnection =
  | 'USB'
  | 'WiFi'
  | 'LAN'
  | 'Bluetooth'
  | 'Virtual';

export type PrinterType =
  | 'LaserJet'
  | 'InkJet'
  | 'Thermal'
  | 'DotMatrix'
  | 'Multifunction';

export type PrinterHealthStatus =
  | 'Online'
  | 'Printing'
  | 'Warning'
  | 'Offline'
  | 'Error'
  | 'Paused';

export type PaperSize = 'A4' | 'Letter' | 'Legal' | 'Custom';
export type PrintQuality = 'Draft' | 'Standard' | 'High';
export type PrintColorMode = 'Black & White' | 'Color';

export interface DetectedPrinter {
  id: string;
  name: string;
  brand: 'HP' | 'Epson' | 'Canon' | 'Brother' | 'TVS' | 'Samsung' | 'Generic';
  model: string;
  type: PrinterType;
  connection: PrinterConnection;
  ipAddress?: string;
  port?: string;
  isColor: boolean;
  isDuplexSupported: boolean;
  isAutoCutSupported: boolean;
  isDriverInstalled: boolean;
  paperLevel: number; // 0 to 100%
  inkLevels: {
    black: number; // 0 to 100%
    cyan?: number;
    magenta?: number;
    yellow?: number;
  };
  status: PrinterHealthStatus;
  firmwareVersion: string;
  serialNumber: string;
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
  | 'NoPrinterFound'
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

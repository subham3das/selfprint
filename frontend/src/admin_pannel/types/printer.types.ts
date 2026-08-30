export type PrinterStatus =
  | 'Online'
  | 'Busy'
  | 'Offline'
  | 'Maintenance'
  | 'Error'
  | 'Printing'
  | 'Idle'
  | 'Out of Paper'
  | 'Out of Ink';

export type PrinterBrand =
  | 'HP'
  | 'Canon'
  | 'Epson'
  | 'Brother'
  | 'Xerox'
  | 'Samsung';

export type PrinterType = 'Laser' | 'Inkjet';

export type ConnectionType = 'Wi-Fi' | 'USB' | 'LAN' | 'Bluetooth';

export interface InkLevelDetails {
  black: number; // 0-100%
  cyan?: number;
  magenta?: number;
  yellow?: number;
}

export interface AdminPrinterItem {
  id: string;
  printerId: string; // e.g. "PRT-250501-0001"
  name: string;
  thumbnailUrl: string;
  serialNumber: string;
  storeName: string;
  storeLogoBg: string;
  storeLogoText: string;
  city: string;
  state: string;
  locationArea: string; // e.g. "Front Counter"
  locationFloor: string; // e.g. "Ground Floor"
  brand: PrinterBrand;
  model: string;
  type: PrinterType;
  connection: ConnectionType;
  ipAddress: string;
  macAddress: string;
  firmwareVersion: string;
  status: PrinterStatus;
  printsThisMonth: number;
  printsTrend: string;
  printsToday: number;
  lifetimePrints: number;
  lastPrinted: string; // e.g. "2 mins ago"
  lastPrintedTime: string; // e.g. "10:28 AM"
  healthPercent: number; // 0-100%
  paperLevelPercent: number; // 0-100%
  paperTrayCapacity: string;
  inkLevels: InkLevelDetails;
  temperature: string; // e.g. "32°C"
  networkStrength: string; // e.g. "98% (Excellent)"
  successRate: string; // e.g. "99.4%"
  avgPrintTime: string; // e.g. "4.2s / page"
  supportedPaperSizes: string[];
}

export interface PrinterStatsData {
  totalPrinters: number;
  onlinePrinters: number;
  onlinePercent: string;
  onlineTrend: string;
  busyPrinters: number;
  busyPercent: string;
  busyTrend: string;
  offlinePrinters: number;
  offlinePercent: string;
  offlineTrend: string;
  maintenancePrinters: number;
  maintenancePercent: string;
  maintenanceTrend: string;
  totalPrintsMonth: number;
  totalPrintsMonthTrend: string;
}

export interface PrinterFilterState {
  searchQuery: string;
  status: string; // 'All' | PrinterStatus
  store: string; // 'All' | string
  city: string; // 'All' | string
  type: string; // 'All' | PrinterType
  brand: string; // 'All' | PrinterBrand
}

export interface PrinterFormValues {
  name: string;
  storeName: string;
  city: string;
  locationArea: string;
  locationFloor: string;
  brand: PrinterBrand;
  model: string;
  type: PrinterType;
  connection: ConnectionType;
  ipAddress: string;
  status: PrinterStatus;
  supportedPaperSizes: string[];
}

export interface TestPrintOptions {
  printerId: string;
  testType: 'Page' | 'Color' | 'Alignment' | 'Nozzle';
  copies: number;
}

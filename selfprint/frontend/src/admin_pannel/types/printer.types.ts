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
  | 'Samsung'
  | string;

export type PrinterType = 'Laser' | 'Inkjet' | 'Color Laser' | 'Mono Laser' | 'Thermal' | string;

export type ConnectionType = 'Wi-Fi' | 'USB' | 'LAN' | 'Bluetooth' | 'Network' | string;

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
  storeId?: string;
  storeName: string;
  storeLogoBg: string;
  storeLogoText: string;
  city: string;
  state: string;
  locationArea: string;
  locationFloor: string;
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
  lastPrinted: string;
  lastPrintedTime: string;
  healthPercent: number; // 0-100%
  paperLevelPercent: number; // 0-100%
  paperTrayCapacity: string;
  inkLevels: InkLevelDetails;
  temperature: string;
  networkStrength: string;
  successRate: string;
  avgPrintTime: string;
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
  status: string;
  store: string;
  city: string;
  type: string;
  brand: string;
}

export interface AdminPrinterFilterOptions {
  stores: { id: string; name: string; city: string }[];
  cities: string[];
  brands: string[];
  models: string[];
  types: string[];
  connectionTypes: string[];
  statuses: string[];
}

export interface AdminPrintersListResponse {
  printers: AdminPrinterItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PrinterFormValues {
  name: string;
  storeId?: string;
  storeName: string;
  city: string;
  locationArea: string;
  locationFloor: string;
  brand: PrinterBrand;
  model: string;
  type: PrinterType;
  connection: ConnectionType;
  ipAddress: string;
  serialNumber?: string;
  status: PrinterStatus;
  supportedPaperSizes: string[];
}

export interface TestPrintOptions {
  printerId: string;
  testType: 'Page' | 'Color' | 'Alignment' | 'Nozzle' | string;
  copies: number;
  paperSize?: string;
}

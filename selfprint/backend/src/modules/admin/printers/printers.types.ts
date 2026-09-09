export interface AdminPrinterStatsResponse {
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

export interface AdminPrinterItemDTO {
  id: string;
  printerId: string;
  name: string;
  thumbnailUrl: string;
  serialNumber: string;
  storeId: string;
  storeName: string;
  storeLogoBg: string;
  storeLogoText: string;
  city: string;
  state: string;
  locationArea: string;
  locationFloor: string;
  brand: string;
  model: string;
  type: string;
  connection: string;
  ipAddress: string;
  macAddress: string;
  firmwareVersion: string;
  status: 'Online' | 'Busy' | 'Offline' | 'Maintenance';
  printsThisMonth: number;
  printsTrend: string;
  printsToday: number;
  lifetimePrints: number;
  lastPrinted: string;
  lastPrintedTime: string;
  healthPercent: number;
  paperLevelPercent: number;
  paperTrayCapacity: string;
  inkLevels: {
    black: number;
    cyan?: number;
    magenta?: number;
    yellow?: number;
  };
  temperature: string;
  networkStrength: string;
  successRate: string;
  avgPrintTime: string;
  supportedPaperSizes: string[];
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
  printers: AdminPrinterItemDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GetPrintersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  store?: string;
  city?: string;
  brand?: string;
  model?: string;
  type?: string;
  connectionType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RegisterPrinterInput {
  storeId: string;
  name: string;
  brand: string;
  model: string;
  type?: string;
  connection?: string;
  ipAddress?: string;
  serialNumber?: string;
  locationArea?: string;
  locationFloor?: string;
  supportedPaperSizes?: string[];
  status?: string;
}

export interface UpdatePrinterInput {
  storeId?: string;
  name?: string;
  brand?: string;
  model?: string;
  type?: string;
  connection?: string;
  ipAddress?: string;
  serialNumber?: string;
  locationArea?: string;
  locationFloor?: string;
  supportedPaperSizes?: string[];
  status?: string;
  paperLevel?: number;
  tonerLevel?: number;
}

export interface TestPrintInput {
  testType: string;
  copies: number;
  paperSize?: string;
}

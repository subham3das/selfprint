import { PrinterConnectionType, PrinterStatusType } from '../../models/printer.model';

export interface SavePrinterDto {
  deviceId?: string;
  printerName: string;
  model: string;
  brand: string;
  driver?: string;
  port?: string;
  connectionType: PrinterConnectionType;
  isDefault?: boolean;
  capabilities?: {
    isColor?: boolean;
    isDuplex?: boolean;
    isAutoCut?: boolean;
    paperSizes?: string[];
  };
}

export interface PairHostDto {
  hostId: string;
  deviceName: string;
  os: string;
  osRelease?: string;
  hostVersion?: string;
  ipAddress?: string;
}

export interface HostHeartbeatDto {
  hostId: string;
  printers: Array<{
    deviceId?: string;
    printerName: string;
    status: PrinterStatusType;
    paperLevel?: number;
    tonerLevel?: number;
  }>;
}

export interface PrinterResponseDto {
  id: string;
  storeId: string;
  printerName: string;
  model: string;
  brand: string;
  driver?: string;
  port?: string;
  connectionType: PrinterConnectionType;
  status: PrinterStatusType;
  paperLevel: number;
  tonerLevel: number;
  isDefault: boolean;
  capabilities?: {
    isColor?: boolean;
    isDuplex?: boolean;
    isAutoCut?: boolean;
    paperSizes?: string[];
  };
  lastHeartbeat: string;
  createdAt: string;
}

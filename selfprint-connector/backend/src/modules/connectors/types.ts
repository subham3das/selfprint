/**
 * TypeScript Interfaces, DTOs, and Document definitions for the SelfPrint Backend Connector Management System.
 */

export type ConnectorStatus = 'ONLINE' | 'OFFLINE' | 'ERROR';

export type AuditActionType =
  | 'REGISTRATION'
  | 'HEARTBEAT'
  | 'ONLINE'
  | 'OFFLINE'
  | 'PRINT_COMMAND'
  | 'RESTART'
  | 'PAUSE'
  | 'RESUME'
  | 'ASSIGNMENT'
  | 'UNASSIGNMENT'
  | 'DELETION'
  | 'CONFIG_UPDATE'
  | 'STATUS_CHANGE'
  | 'REMOTE_COMMAND'
  | 'DIAGNOSTICS_RUN';

export interface PrinterDeviceDto {
  id: string;
  name: string;
  driverName: string;
  portName: string;
  location?: string;
  comment?: string;
  manufacturer?: string;
  model?: string;
  isDefault: boolean;
  isNetwork: boolean;
  isShared: boolean;
  shareName?: string;
  status: 'ONLINE' | 'OFFLINE' | 'ERROR' | 'PAPER_JAM' | 'OUT_OF_PAPER' | 'LOW_TONER' | 'PRINTING' | 'PAUSED' | 'UNKNOWN';
  isOnline: boolean;
  jobsWaiting: number;
  colorSupport: boolean;
  duplexSupport: boolean;
  paperSizes: string[];
  trayList: string[];
  resolution: string;
  capabilities: string[];
  connectionType: 'USB' | 'NETWORK' | 'SHARED' | 'LOCAL' | 'WIRELESS' | 'BLUETOOTH';
  ipAddress?: string | null;
  mac?: string | null;
  serialNumber?: string | null;
  lastSeen: string;
}

export interface RegisterConnectorDto {
  connectorId: string;
  machineId: string;
  hostname: string;
  osVersion: string;
  windowsUser?: string;
  connectorVersion: string;
}

export interface RegisterResponseDto {
  success: boolean;
  message: string;
  data: {
    deviceToken: string;
    connectorId: string;
    machineId: string;
    heartbeatInterval: number;
    scanInterval: number;
    websocketURL: string;
  };
}

export interface HeartbeatDto {
  connectorId: string;
  machineId: string;
  uptime: number;
  printerCount: number;
  memoryUsage?: {
    totalMB: number;
    freeMB: number;
    processMB: number;
  };
  diskUsage?: {
    freeGB: number;
    totalGB: number;
  };
  cpuUsage?: number;
  spoolerStatus?: string;
  activeQueueSize?: number;
  connectorVersion?: string;
}

export interface PrinterSyncDto {
  connectorId: string;
  machineId?: string;
  printers: PrinterDeviceDto[];
}

export interface ConnectorDocument {
  _id?: string;
  connectorId: string;
  machineId: string;
  deviceTokenHash: string;
  hostname: string;
  windowsUser: string;
  osVersion: string;
  connectorVersion: string;
  status: ConnectorStatus;
  lastHeartbeat: Date;
  lastSeen: Date;
  currentIp: string;
  storeId: string | null;
  connectedPrinters: PrinterDeviceDto[];
  cpu: number;
  ram: {
    totalMB: number;
    freeMB: number;
    processMB: number;
  };
  disk: {
    freeGB: number;
    totalGB: number;
  };
  internet: boolean;
  uptime: number;
  latency: number | null;
  printerCount: number;
  activeQueueSize: number;
  spoolerStatus: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConnectorAuditLog {
  _id?: string;
  connectorId: string;
  action: AuditActionType;
  details?: Record<string, unknown> | null;
  performedBy: string;
  ipAddress: string;
  timestamp: Date;
}

export interface ConnectorQueryFilter {
  status?: ConnectorStatus;
  storeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ConnectorCommandPayload {
  command:
    | 'refresh_printers'
    | 'print_pdf'
    | 'pause_printer'
    | 'resume_printer'
    | 'restart_printer'
    | 'cancel_job'
    | 'request_status'
    | 'update_config'
    | 'restart_spooler'
    | 'test_print';
  payload?: Record<string, unknown>;
}

export interface StoreNotificationPayload {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  type?: string;
}

export interface DiagnosticReport {
  connectorId: string;
  machineId: string;
  hostname: string;
  windowsUser: string;
  osVersion: string;
  connectorVersion: string;
  storeId: string | null;
  status: ConnectorStatus;
  lastHeartbeat: Date;
  uptimeSeconds: number;
  cpuUsagePercent: number;
  memory: {
    totalMB: number;
    freeMB: number;
    processRssMB: number;
  };
  disk: {
    freeGB: number;
    totalGB: number;
  };
  spoolerStatus: string;
  hasInternet: boolean;
  backendLatencyMs: number | null;
  printers: Array<{
    id: string;
    name: string;
    status: string;
    isOnline: boolean;
    jobsWaiting: number;
    connectionType: string;
  }>;
  diagnosticTimestamp: string;
  generatedBy: string;
}

export interface QueuedCommand {
  id: string;
  connectorId: string;
  storeId: string;
  command: string;
  payload?: Record<string, unknown>;
  queuedAt: Date;
  performedBy: string;
}

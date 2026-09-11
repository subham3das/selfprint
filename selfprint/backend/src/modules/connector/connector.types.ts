/**
 * Canonical SelfPrint Connection State Machine Enum
 * Shared across Backend, Desktop Connector, and Store Dashboard.
 */
export type ConnectionState =
  | 'NOT_INSTALLED'
  | 'INSTALLED_NOT_RUNNING'
  | 'RUNNING_UNPAIRED'
  | 'NOT_PAIRED'
  | 'PAIRING'
  | 'AUTHENTICATING'
  | 'CONNECTED'
  | 'HOST_RUNNING'
  | 'SCANNING'
  | 'SCANNING_PRINTERS'
  | 'READY'
  | 'RECONNECTING'
  | 'OFFLINE'
  | 'ERROR';

export interface ConnectorRegistryRecord {
  connectorId: string;
  storeId: string;
  hostname: string;
  machineId: string;
  version: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  state: ConnectionState;
  socketConnected: boolean;
  lastHeartbeat: Date;
  lastSeen: Date;
  health: {
    cpuUsagePercent?: number;
    memoryMB?: number;
    printSpoolerStatus?: string;
    hasInternet?: boolean;
    latencyMs?: number | null;
  };
  connectedPrinters: number;
  physicalPrinters: any[];
  driverVersion?: string;
  hostRunning: boolean;
  authenticated: boolean;
  assignedPrinter?: string | null;
  notifications?: Array<{
    type: string;
    title: string;
    message: string;
    timestamp: Date;
  }>;
}

export type RemoteCommandType =
  | 'restart_connector'
  | 'restart_host'
  | 'rescan_printers'
  | 'test_print'
  | 'pause_printer'
  | 'resume_printer'
  | 'cancel_job'
  | 'update_config'
  | 'download_logs'
  | 'diagnostics';

export interface RemoteCommandPayload {
  commandId: string;
  command: RemoteCommandType;
  targetConnectorId?: string;
  targetPrinter?: string;
  params?: Record<string, any>;
  issuedBy?: string;
  issuedAt: string;
}

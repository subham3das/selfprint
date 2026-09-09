export type NavigationTab = 'dashboard' | 'printers' | 'notifications' | 'activity' | 'settings' | 'about';

export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  timestamp: string;
  read: boolean;
  source?: 'CONNECTOR' | 'BACKEND' | 'PRINTER' | 'SPOOLER';
}

export interface ActivityEvent {
  id: string;
  type:
    | 'CONNECTOR_STARTED'
    | 'CONNECTOR_STOPPED'
    | 'PRINTER_CONNECTED'
    | 'PRINTER_REMOVED'
    | 'PRINT_STARTED'
    | 'DOWNLOAD_STARTED'
    | 'DOWNLOAD_FINISHED'
    | 'PRINTING'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'RESTARTED'
    | 'ERROR'
    | 'WARNING';
  title: string;
  description: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export interface PrinterDevice {
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

export interface HealthData {
  service: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  uptimeSeconds: number;
  connectorId: string;
  machineId: string;
  hostname: string;
  windowsUser: string;
  connectorVersion: string;
  lastHeartbeat: string | null;
  backendUrl: string;
  isRegistered: boolean;
  telemetry?: {
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
    windowsUptimeSeconds: number;
    printSpoolerStatus: string;
    hasInternet: boolean;
    backendLatencyMs: number | null;
    printerCount: number;
    activeQueueSize: number;
  };
}

export interface PrintJobRecord {
  jobId: string;
  printer: string;
  status: 'QUEUED' | 'DOWNLOADING' | 'READY' | 'PRINTING' | 'PAGE_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  pages?: number;
  copies?: number;
  error?: string;
}

export interface ConnectorSettings {
  backendUrl: string;
  heartbeatIntervalMs: number;
  scanIntervalMs: number;
  logLevel: string;
  autoUpdate: boolean;
  launchOnStartup: boolean;
  runAsService: boolean;
}

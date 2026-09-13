/**
 * Cross-platform Printer Definitions & Print Pipeline Types for SelfPrint Connector.
 */

export type PrinterStatus =
  | 'ONLINE'
  | 'OFFLINE'
  | 'ERROR'
  | 'PAPER_JAM'
  | 'OUT_OF_PAPER'
  | 'LOW_TONER'
  | 'PRINTING'
  | 'PAUSED'
  | 'UNKNOWN';

export type ConnectionType =
  | 'USB'
  | 'NETWORK'
  | 'SHARED'
  | 'LOCAL'
  | 'WIRELESS'
  | 'BLUETOOTH'
  | 'VIRTUAL';

export type PrintJobStatus =
  | 'QUEUED'
  | 'DOWNLOADING'
  | 'READY'
  | 'PRINTING'
  | 'PAGE_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface Printer {
  id: string;
  name: string;
  driverName: string;
  portName: string;
  location: string;
  comment: string;
  manufacturer: string;
  model: string;
  isDefault: boolean;
  isNetwork: boolean;
  isShared: boolean;
  shareName: string;
  status: PrinterStatus;
  isOnline: boolean;
  jobsWaiting: number;
  colorSupport: boolean;
  duplexSupport: boolean;
  paperSizes: string[];
  trayList: string[];
  resolution: string;
  capabilities: string[];
  connectionType: ConnectionType;
  ipAddress: string | null;
  mac: string | null;
  serialNumber: string | null;
  lastSeen: string;
  isVirtual?: boolean;
  isTestMode?: boolean;
}

export interface PrintJobOptions {
  jobId: string;
  fileUrl: string;
  printerId?: string;
  printerName?: string;
  copies?: number;
  paperSize?: string;
  orientation?: 'portrait' | 'landscape';
  colorMode?: 'color' | 'monochrome' | 'grayscale';
  duplex?: 'single' | 'duplex' | 'duplex-long' | 'duplex-short';
  pageRange?: string;
  checksum?: string;
  timeoutMs?: number;
}

export interface PrintJobProgress {
  jobId: string;
  status: PrintJobStatus;
  printerName: string;
  currentPage?: number;
  totalPages?: number;
  progressPercent?: number;
  error?: string;
  timestamp: string;
}

export interface PrintHistoryItem {
  jobId: string;
  printer: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  pages: number;
  copies: number;
  status: PrintJobStatus;
  error: string | null;
}

export interface SpoolerJobInfo {
  jobId: number;
  printerName: string;
  documentName: string;
  jobStatus: string;
  statusCode: number;
  totalPageCount: number;
  pagesPrinted: number;
  sizeBytes: number;
  submittedTime: string;
}

export interface PrinterDiff {
  added: Printer[];
  removed: Printer[];
  updated: Array<{
    previous: Printer;
    current: Printer;
    changes: string[];
  }>;
  statusChanged: Array<{
    printer: Printer;
    previousStatus: PrinterStatus;
    currentStatus: PrinterStatus;
  }>;
  defaultChanged: {
    previousDefault: Printer | null;
    currentDefault: Printer | null;
  } | null;
}

export interface IPrinterDetector {
  detectPrinters(): Promise<Printer[]>;
}

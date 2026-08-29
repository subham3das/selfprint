export type JobStatus = 'Printing' | 'Waiting' | 'Completed' | 'Failed';
export type ColorMode = 'B&W' | 'Color';
export type AlertSeverity = 'Low' | 'Critical';

export interface JobItem {
  id: string;
  jobCode: string; // e.g. "#102"
  fileName: string;
  fileType: 'pdf' | 'doc' | 'img';
  fileSize?: string;
  customer: string;
  pages: number;
  copies: number;
  colorMode: ColorMode;
  status: JobStatus;
  time: string; // e.g. "10:24 AM"
  timeAgo: string; // e.g. "2 mins ago"
  cost: number;
}

export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    period: string;
  };
  actionLabel?: string;
  actionTab?: string;
  variant: 'purple' | 'green' | 'blue' | 'amber';
}

export interface PrinterStatusInfo {
  name: string;
  model: string;
  isOnline: boolean;
  connectionStatus: 'Connected' | 'Disconnected';
  printerStatus: 'Ready' | 'Printing' | 'Paused' | 'Error';
  paperSize: string;
  tonerPercentage: number;
  ipAddress?: string;
}

export interface ActivityItem {
  id: string;
  jobCode: string;
  action: 'completed' | 'started printing' | 'added to queue' | 'failed';
  fileName: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface StockAlertItem {
  id: string;
  itemName: string;
  details: string;
  severity: AlertSeverity;
  type: 'paper' | 'toner' | 'ink';
}

export interface SummaryBreakdown {
  totalJobs: number;
  completed: number;
  completedPercent: number;
  printing: number;
  printingPercent: number;
  waiting: number;
  waitingPercent: number;
  failed: number;
  failedPercent: number;
  totalRevenue: string;
}

export interface StoreInfo {
  name: string;
  location: string;
  avatarUrl?: string;
  isOnline: boolean;
  isPaused: boolean;
}

export type QueueTab = 'All' | 'Printing' | 'Waiting' | 'Completed' | 'Failed';

export type JobStatus = 'Printing' | 'Waiting' | 'Completed' | 'Failed' | 'Cancelled';
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
  fileUrl?: string;
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
  id?: string;
  name: string;
  model: string;
  isOnline: boolean;
  isConfigured?: boolean;
  connectionStatus: 'Connected' | 'Disconnected';
  printerStatus: 'Ready' | 'Printing' | 'Paused' | 'Warning' | 'Error' | 'Offline' | 'Not Configured';
  paperSize: string;
  tonerPercentage: number;
  paperPercentage?: number;
  ipAddress?: string;
}

export interface ActivityItem {
  id: string;
  jobCode: string;
  action: string;
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
  id?: string;
  name: string;
  location: string;
  storeCode?: string;
  ownerName?: string;
  avatarUrl?: string;
  isOnline: boolean;
  isPaused: boolean;
  isFirstLogin?: boolean;
  printerConfigured?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  isRead?: boolean;
  jobId?: string;
  type?: 'job' | 'alert' | 'payment';
}

export type QueueTab = 'All' | 'All Jobs' | 'Printing' | 'Waiting' | 'Completed' | 'Failed';

export interface StoreDashboardOverview {
  store: StoreInfo;
  printer: PrinterStatusInfo;
  stats: StatItem[];
  recentQueue: JobItem[];
  activities: ActivityItem[];
  stockAlerts: StockAlertItem[];
  summary: SummaryBreakdown;
  notificationsCount: number;
  lastUpdated: string;
}

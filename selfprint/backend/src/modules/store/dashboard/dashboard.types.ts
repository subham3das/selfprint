export interface StoreInfoDto {
  id: string;
  name: string;
  location: string;
  storeCode: string;
  ownerName: string;
  isOnline: boolean;
  isPaused: boolean;
  isFirstLogin?: boolean;
  printerConfigured?: boolean;
}

export interface PrinterStatusDto {
  id?: string;
  name: string;
  model: string;
  isOnline: boolean;
  isConfigured: boolean;
  connectionStatus: 'Connected' | 'Disconnected';
  printerStatus: 'Ready' | 'Printing' | 'Paused' | 'Warning' | 'Error' | 'Offline' | 'Not Configured';
  paperSize: string;
  tonerPercentage: number;
  paperPercentage: number;
  ipAddress: string;
}

export interface StatItemDto {
  id: 'jobs' | 'revenue' | 'printing' | 'waiting';
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
    period: string;
  };
  actionLabel?: string;
  actionTab?: string;
  variant: 'purple' | 'green' | 'blue' | 'amber';
}

export interface QueueJobDto {
  id: string;
  jobCode: string;
  fileName: string;
  fileType: 'pdf' | 'doc' | 'img';
  fileSize: string;
  customer: string;
  pages: number;
  copies: number;
  colorMode: 'B&W' | 'Color';
  status: 'Printing' | 'Waiting' | 'Completed' | 'Failed' | 'Cancelled';
  time: string;
  timeAgo: string;
  cost: number;
  fileUrl?: string;
}

export interface ActivityItemDto {
  id: string;
  jobCode: string;
  action: string;
  fileName: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface StockAlertItemDto {
  id: string;
  itemName: string;
  details: string;
  severity: 'Low' | 'Critical';
  type: 'paper' | 'toner' | 'ink';
}

export interface SummaryBreakdownDto {
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

export interface NotificationItemDto {
  id: string;
  title: string;
  desc: string;
  time: string;
}

export interface StoreDashboardOverviewDto {
  store: StoreInfoDto;
  printer: PrinterStatusDto;
  stats: StatItemDto[];
  recentQueue: QueueJobDto[];
  activities: ActivityItemDto[];
  stockAlerts: StockAlertItemDto[];
  summary: SummaryBreakdownDto;
  notificationsCount: number;
  lastUpdated: string;
}

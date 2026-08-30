export type AdminNavRoute =
  | 'dashboard'
  | 'stores'
  | 'users'
  | 'transactions'
  | 'revenue'
  | 'printers'
  | 'support'
  | 'analytics'
  | 'access'
  | 'audit'
  | 'settings';



export interface AdminStatCardItem {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  comparisonText: string;
  iconName:
    | 'store'
    | 'active-store'
    | 'offline-store'
    | 'users'
    | 'orders'
    | 'live-orders'
    | 'completed-orders'
    | 'failed-orders'
    | 'today-revenue'
    | 'monthly-revenue'
    | 'commission'
    | 'aov';
  colorScheme:
    | 'blue'
    | 'emerald'
    | 'red'
    | 'indigo'
    | 'amber'
    | 'purple'
    | 'teal'
    | 'pink';
  isLive?: boolean;
}

export interface RevenueDataPoint {
  date: string;
  displayDate: string;
  revenue: number;
  orders: number;
}

export interface RevenueOverviewData {
  totalRevenue: string;
  changePercentage: string;
  comparisonPeriod: string;
  points: RevenueDataPoint[];
}

export interface LivePrintActivityItem {
  id: string;
  storeName: string;
  status: 'Printing' | 'Completed' | 'Processing';
  fileName: string;
  pageProgress: string;
  colorChip: 'purple' | 'green' | 'amber';
  timestamp: string;
}

export interface TopPerformingStoreItem {
  id: string;
  storeName: string;
  revenue: string;
  orders: number;
  commission: string;
  status: 'Online' | 'Busy' | 'Offline';
}

export interface DashboardTransactionItem {
  id: string;
  storeName: string;
  customerName: string;
  amount: string;
  commission: string;
  paymentMethod: 'UPI' | 'Wallet' | 'Card';
  status: 'Success' | 'Pending' | 'Failed';
  timestamp: string;
}


export interface DonutChartSegment {
  label: string;
  percentage: number;
  color: string;
}

export interface PlatformAnalyticsData {
  printType: DonutChartSegment[];
  paperSize: DonutChartSegment[];
  mostUsedPrinters: DonutChartSegment[];
  peakHours: DonutChartSegment[];
}

export interface SystemAlertItem {
  id: string;
  title: string;
  count: number;
  countLabel: string;
  alertType: 'danger' | 'warning' | 'info';
  icon: 'alert-triangle' | 'printer-off' | 'wifi-off' | 'credit-card-off' | 'user-plus';
}

export interface RecentUserItem {
  id: string;
  name: string;
  storeName: string;
  lastActivity: string;
  avatarUrl?: string;
  isOnline: boolean;
}

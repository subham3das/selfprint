export interface AdminDashboardStatCard {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  comparisonText: string;
  iconName: string;
  colorScheme: 'blue' | 'emerald' | 'red' | 'indigo' | 'amber' | 'purple' | 'teal' | 'pink';
  isLive?: boolean;
}

export interface RevenuePoint {
  date: string;
  displayDate: string;
  revenue: number;
  orders: number;
}

export interface RevenueOverviewResponse {
  totalRevenue: string;
  changePercentage: string;
  comparisonPeriod: string;
  points: RevenuePoint[];
}

export interface LivePrintActivityItem {
  id: string;
  storeName: string;
  status: string;
  fileName: string;
  pageProgress: string;
  colorChip: 'purple' | 'green' | 'amber' | 'red';
  timestamp: string;
}

export interface TopPerformingStoreItem {
  id: string;
  storeName: string;
  revenue: string;
  orders: number;
  commission: string;
  status: 'Online' | 'Offline' | 'Busy' | 'Suspended';
}

export interface DashboardTransactionItem {
  id: string;
  storeName: string;
  customerName: string;
  amount: string;
  commission: string;
  paymentMethod: string;
  status: 'Success' | 'Pending' | 'Failed' | 'Refunded';
  timestamp: string;
}

export interface PlatformAnalyticsBreakdown {
  label: string;
  percentage: number;
  color: string;
}

export interface PlatformAnalyticsResponse {
  printType: PlatformAnalyticsBreakdown[];
  paperSize: PlatformAnalyticsBreakdown[];
  mostUsedPrinters: PlatformAnalyticsBreakdown[];
  peakHours: PlatformAnalyticsBreakdown[];
}

export interface SystemAlertItem {
  id: string;
  title: string;
  count: number;
  countLabel: string;
  alertType: 'danger' | 'warning' | 'info';
  icon: string;
}

export interface RecentUserItem {
  id: string;
  name: string;
  storeName: string;
  lastActivity: string;
  avatarUrl: string;
  isOnline: boolean;
}

export interface DashboardOverviewResponse {
  stats: AdminDashboardStatCard[];
  summary: AdminDashboardStatCard[];
  revenueData: RevenueOverviewResponse;
  revenueOverview: RevenueOverviewResponse;
  liveActivities: LivePrintActivityItem[];
  livePrintActivity: LivePrintActivityItem[];
  topStores: TopPerformingStoreItem[];
  transactions: DashboardTransactionItem[];
  recentTransactions: DashboardTransactionItem[];
  analytics: PlatformAnalyticsResponse;
  alerts: SystemAlertItem[];
  recentUsers: RecentUserItem[];
}

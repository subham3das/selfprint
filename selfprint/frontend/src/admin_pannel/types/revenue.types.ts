export type RevenuePeriod = 'daily' | 'weekly' | 'monthly';

export type RevenueFilterPeriod =
  | 'Today'
  | 'This Week'
  | 'This Month'
  | 'Last Month'
  | 'This Year'
  | 'Custom';

export interface RevenueStatsData {
  totalRevenue: string;
  totalRevenueTrend: string;
  platformCommission: string;
  platformCommissionTrend: string;
  totalTransactions: number;
  totalTransactionsTrend: string;
  averageOrderValue: string;
  averageOrderValueTrend: string;
  refundsAdjustments: string;
  refundsTrend: string;
  netRevenue: string;
  netRevenueTrend: string;
}

export interface RevenueChartPoint {
  date?: string;
  label: string;
  revenue: number;
  revenueFormatted: string;
  orders: number;
}

export interface CategoryRevenueSegment {
  name: string;
  amountFormatted: string;
  amountRaw: number;
  percentage: number;
  color: string;
}

export interface PaymentMethodRevenueSegment {
  name: string;
  amountFormatted: string;
  amountRaw: number;
  percentage: number;
  color: string;
}

export interface TopStoreRevenueItem {
  id: string;
  storeName: string;
  logoBg: string;
  logoText: string;
  city: string;
  state: string;
  revenue: string;
  transactions: number;
  commission: string;
  status: 'Online' | 'Busy' | 'Offline';
}

export interface TopCityRevenueItem {
  id: string;
  city: string;
  state: string;
  revenueFormatted: string;
  revenueRaw: number;
  transactions: number;
  progressPercent: number;
}

export interface RecentRevenueTransactionItem {
  id: string;
  txnId: string;
  storeName: string;
  amountFormatted: string;
  commissionFormatted: string;
  paymentMethod?: string;
  status: 'Success' | 'Pending' | 'Failed';
  date: string;
  time: string;
}

export interface RevenueFilterOptions {
  stores: string[];
  cities: string[];
  paymentMethods: string[];
  revenueTypes: string[];
  periods: string[];
}

export interface RevenueOverviewResponse {
  stats: RevenueStatsData;
  chart: RevenueChartPoint[];
  paymentMethods: PaymentMethodRevenueSegment[];
  revenueCategories: CategoryRevenueSegment[];
  topStores: TopStoreRevenueItem[];
  topCities: TopCityRevenueItem[];
  recentTransactions: RecentRevenueTransactionItem[];
  filters: RevenueFilterOptions;
}

export interface RevenueFilterState {
  period: RevenueFilterPeriod;
  store: string;
  city: string;
  revenueType: string;
  dateRange: string;
}

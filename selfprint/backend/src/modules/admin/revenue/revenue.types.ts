export interface RevenueStatsResponse {
  totalRevenue: string;
  totalRevenueRaw: number;
  totalRevenueTrend: string;
  platformCommission: string;
  platformCommissionRaw: number;
  platformCommissionTrend: string;
  totalTransactions: number;
  totalTransactionsTrend: string;
  averageOrderValue: string;
  averageOrderValueRaw: number;
  averageOrderValueTrend: string;
  refundsAdjustments: string;
  refundsAdjustmentsRaw: number;
  refundsTrend: string;
  netRevenue: string;
  netRevenueRaw: number;
  netRevenueTrend: string;
}

export interface RevenueChartPoint {
  date: string;
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
  revenueRaw: number;
  transactions: number;
  commission: string;
  status: 'Online' | 'Offline' | 'Busy';
}

export interface TopCityRevenueItem {
  id: string;
  city: string;
  state: string;
  revenueRaw: number;
  revenueFormatted: string;
  transactions: number;
  progressPercent: number;
}

export interface RecentRevenueTransactionItem {
  id: string;
  txnId: string;
  storeName: string;
  amountFormatted: string;
  commissionFormatted: string;
  paymentMethod: string;
  status: 'Success' | 'Pending' | 'Failed' | 'Refunded';
  date: string;
  time: string;
  timestamp: string;
}

export interface RevenueFilterOptions {
  stores: string[];
  cities: string[];
  paymentMethods: string[];
  revenueTypes: string[];
  periods: string[];
}

export interface RevenueAnalyticsOverviewResponse {
  stats: RevenueStatsResponse;
  chart: RevenueChartPoint[];
  paymentMethods: PaymentMethodRevenueSegment[];
  revenueCategories: CategoryRevenueSegment[];
  topStores: TopStoreRevenueItem[];
  topCities: TopCityRevenueItem[];
  recentTransactions: RecentRevenueTransactionItem[];
  filters: RevenueFilterOptions;
}

export interface GetRevenueQuery {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  store?: string;
  city?: string;
  revenueType?: string;
  startDate?: string;
  endDate?: string;
}

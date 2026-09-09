import { apiClient } from '@/lib/axios';
import {
  AdminStatCardItem,
  RevenueOverviewData,
  LivePrintActivityItem,
  TopPerformingStoreItem,
  DashboardTransactionItem,
  PlatformAnalyticsData,
  SystemAlertItem,
  RecentUserItem
} from '../types/admin.types';

export const adminDashboardService = {
  /**
   * Fetch complete dashboard overview in one parallel request
   */
  async fetchOverview(revenuePeriod = 'This Week', analyticsPeriod = 'This Month') {
    const res = await apiClient.get('/admin/dashboard/overview', {
      params: { revenuePeriod, analyticsPeriod }
    });
    return res.data?.data;
  },

  /**
   * Fetch 12 metric cards
   */
  async fetchStats(): Promise<AdminStatCardItem[]> {
    const res = await apiClient.get('/admin/dashboard/stats');
    return res.data?.data;
  },

  /**
   * Fetch revenue chart time-series data
   */
  async fetchRevenue(period: 'This Week' | 'This Month' | 'This Year'): Promise<RevenueOverviewData> {
    const res = await apiClient.get('/admin/dashboard/revenue', {
      params: { period }
    });
    return res.data?.data;
  },

  /**
   * Fetch live print spooler activities
   */
  async fetchActivities(): Promise<LivePrintActivityItem[]> {
    const res = await apiClient.get('/admin/dashboard/activity');
    return res.data?.data;
  },

  /**
   * Fetch top performing store partners
   */
  async fetchTopStores(): Promise<TopPerformingStoreItem[]> {
    const res = await apiClient.get('/admin/dashboard/top-stores');
    return res.data?.data;
  },

  /**
   * Fetch recent transactions
   */
  async fetchTransactions(limit = 5): Promise<DashboardTransactionItem[]> {
    const res = await apiClient.get('/admin/dashboard/transactions', {
      params: { limit }
    });
    return res.data?.data;
  },

  /**
   * Fetch platform analytics distributions
   */
  async fetchAnalytics(period = 'This Month'): Promise<PlatformAnalyticsData> {
    const res = await apiClient.get('/admin/dashboard/analytics', {
      params: { period }
    });
    return res.data?.data;
  },

  /**
   * Fetch system alerts
   */
  async fetchAlerts(): Promise<SystemAlertItem[]> {
    const res = await apiClient.get('/admin/dashboard/alerts');
    return res.data?.data;
  },

  /**
   * Fetch recent users
   */
  async fetchRecentUsers(): Promise<RecentUserItem[]> {
    const res = await apiClient.get('/admin/dashboard/users');
    return res.data?.data;
  },

  /**
   * Global search
   */
  async search(q: string) {
    const res = await apiClient.get('/admin/dashboard/search', {
      params: { q }
    });
    return res.data?.data;
  }
};

export default adminDashboardService;

import { apiClient } from '@/lib/axios';
import {
  RevenueOverviewResponse,
  RevenueStatsData,
  RevenueChartPoint,
  RevenueFilterOptions,
  RevenuePeriod
} from '../types/revenue.types';

export const adminRevenueService = {
  /**
   * Fetch complete revenue analytics overview in one parallel request
   */
  async fetchOverview(params: {
    period?: RevenuePeriod;
    store?: string;
    city?: string;
    revenueType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<RevenueOverviewResponse> {
    const res = await apiClient.get('/admin/revenue/overview', { params });
    return res.data?.data;
  },

  /**
   * Fetch 6 revenue KPI cards with trends
   */
  async fetchStats(params?: { store?: string }): Promise<RevenueStatsData> {
    const res = await apiClient.get('/admin/revenue/stats', { params });
    return res.data?.data;
  },

  /**
   * Fetch time-series revenue curve points
   */
  async fetchChart(period: RevenuePeriod, params?: { store?: string }): Promise<RevenueChartPoint[]> {
    const res = await apiClient.get('/admin/revenue/chart', {
      params: { period, ...params }
    });
    return res.data?.data || [];
  },

  /**
   * Fetch dynamic stores and cities options
   */
  async fetchFilters(): Promise<RevenueFilterOptions> {
    const res = await apiClient.get('/admin/revenue/filters');
    return res.data?.data;
  }
};

export default adminRevenueService;

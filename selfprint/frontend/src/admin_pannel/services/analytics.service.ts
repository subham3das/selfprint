import { apiClient } from '@/lib/axios';
import {
  AnalyticsPeriod,
  AdminAnalyticsDashboardResponse,
  AnalyticsStatsData,
  PrintingActivityDataPoint,
  PlatformHealthMetric,
  HeatmapCell,
  AnalyticsTopStoreItem,
  PaperUsageItem,
  PrintTypeSegment,
  PrinterStatusSegment,
  PlatformEventItem,
  QuickInsightItem
} from '../types/analytics.types';

export const adminAnalyticsService = {
  /**
   * Fetch complete analytics dashboard
   */
  async fetchDashboard(period: AnalyticsPeriod = 'Month'): Promise<AdminAnalyticsDashboardResponse> {
    const res = await apiClient.get('/admin/analytics/dashboard', { params: { period } });
    return res.data?.data;
  },

  /**
   * Fetch 6 KPI cards
   */
  async fetchStats(): Promise<AnalyticsStatsData> {
    const res = await apiClient.get('/admin/analytics/stats');
    return res.data?.data;
  },

  /**
   * Fetch multi-stream activity data points
   */
  async fetchActivity(period: AnalyticsPeriod = 'Month'): Promise<PrintingActivityDataPoint[]> {
    const res = await apiClient.get('/admin/analytics/activity', { params: { period } });
    return res.data?.data;
  },

  /**
   * Fetch platform health metrics
   */
  async fetchPlatformHealth(): Promise<PlatformHealthMetric> {
    const res = await apiClient.get('/admin/analytics/platform-health');
    return res.data?.data;
  },

  /**
   * Fetch 7x24 heatmap cells
   */
  async fetchHeatmap(): Promise<HeatmapCell[]> {
    const res = await apiClient.get('/admin/analytics/heatmap');
    return res.data?.data;
  },

  /**
   * Fetch top performing stores
   */
  async fetchTopStores(): Promise<AnalyticsTopStoreItem[]> {
    const res = await apiClient.get('/admin/analytics/top-stores');
    return res.data?.data;
  },

  /**
   * Fetch paper usage statistics
   */
  async fetchPaperUsage(): Promise<PaperUsageItem[]> {
    const res = await apiClient.get('/admin/analytics/paper-sizes');
    return res.data?.data;
  },

  /**
   * Fetch print type distribution
   */
  async fetchPrintTypes(): Promise<PrintTypeSegment[]> {
    const res = await apiClient.get('/admin/analytics/print-types');
    return res.data?.data;
  },

  /**
   * Fetch printer status distribution
   */
  async fetchPrinterStatus(): Promise<PrinterStatusSegment[]> {
    const res = await apiClient.get('/admin/analytics/printer-status');
    return res.data?.data;
  },

  /**
   * Fetch recent platform telemetry events
   */
  async fetchRecentEvents(): Promise<PlatformEventItem[]> {
    const res = await apiClient.get('/admin/analytics/recent-events');
    return res.data?.data;
  },

  /**
   * Fetch 8 quick insights
   */
  async fetchQuickInsights(): Promise<QuickInsightItem[]> {
    const res = await apiClient.get('/admin/analytics/quick-insights');
    return res.data?.data;
  }
};

export default adminAnalyticsService;

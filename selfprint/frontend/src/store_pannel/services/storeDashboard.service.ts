import { apiClient } from '@/lib/axios';
import {
  StoreDashboardOverview,
  JobItem,
  ActivityItem,
  StockAlertItem,
  SummaryBreakdown,
  NotificationItem
} from '../types/dashboard.types';

export interface ApiResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface QueueResponseData {
  jobs: JobItem[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationsResponseData {
  unreadCount: number;
  notifications: NotificationItem[];
}

export const storeDashboardService = {
  /**
   * Fetch full dashboard overview data
   */
  getDashboardOverview: async (storeId?: string): Promise<StoreDashboardOverview> => {
    const params = storeId ? { storeId } : undefined;
    const response = await apiClient.get<ApiResponseEnvelope<StoreDashboardOverview>>(
      '/store/dashboard',
      { params }
    );
    return response.data.data;
  },

  /**
   * Fetch filtered queue table
   */
  getRecentQueue: async (
    storeId?: string,
    status?: string,
    page = 1,
    limit = 10
  ): Promise<QueueResponseData> => {
    const params: Record<string, any> = { page, limit };
    if (storeId) params.storeId = storeId;
    if (status && status !== 'All') params.status = status;

    const response = await apiClient.get<ApiResponseEnvelope<QueueResponseData>>(
      '/store/dashboard/queue',
      { params }
    );
    return response.data.data;
  },

  /**
   * Fetch today's activity items
   */
  getTodayActivity: async (storeId?: string, limit = 10): Promise<ActivityItem[]> => {
    const params: Record<string, any> = { limit };
    if (storeId) params.storeId = storeId;

    const response = await apiClient.get<ApiResponseEnvelope<ActivityItem[]>>(
      '/store/dashboard/activity',
      { params }
    );
    return response.data.data;
  },

  /**
   * Fetch stock alerts
   */
  getStockAlerts: async (storeId?: string): Promise<StockAlertItem[]> => {
    const params = storeId ? { storeId } : undefined;
    const response = await apiClient.get<ApiResponseEnvelope<StockAlertItem[]>>(
      '/store/dashboard/stock-alerts',
      { params }
    );
    return response.data.data;
  },

  /**
   * Fetch today's summary chart breakdown
   */
  getTodaySummary: async (storeId?: string): Promise<SummaryBreakdown> => {
    const params = storeId ? { storeId } : undefined;
    const response = await apiClient.get<ApiResponseEnvelope<SummaryBreakdown>>(
      '/store/dashboard/summary',
      { params }
    );
    return response.data.data;
  },

  /**
   * Fetch notifications list
   */
  getNotifications: async (
    storeId?: string,
    limit = 10
  ): Promise<NotificationsResponseData> => {
    const params: Record<string, any> = { limit };
    if (storeId) params.storeId = storeId;

    const response = await apiClient.get<ApiResponseEnvelope<NotificationsResponseData>>(
      '/store/dashboard/notifications',
      { params }
    );
    return response.data.data;
  }
};

export default storeDashboardService;

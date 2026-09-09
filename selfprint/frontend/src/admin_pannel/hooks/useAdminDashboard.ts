import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminDashboardService } from '../services/dashboard.service';
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
import { getSocket } from '@/lib/socket';

const defaultRevenue: RevenueOverviewData = {
  totalRevenue: '₹0',
  changePercentage: '0%',
  comparisonPeriod: 'vs previous period',
  points: []
};

const defaultAnalytics: PlatformAnalyticsData = {
  printType: [],
  paperSize: [],
  mostUsedPrinters: [],
  peakHours: []
};

export const useAdminDashboard = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('Today (Live)');
  const [revenuePeriod, setRevenuePeriod] = useState<'This Week' | 'This Month' | 'This Year'>('This Week');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'This Month' | 'This Year'>('This Month');
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // 1. Unified Dashboard Overview Query
  const {
    data: overviewData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-dashboard-overview', revenuePeriod, analyticsPeriod],
    queryFn: () => adminDashboardService.fetchOverview(revenuePeriod, analyticsPeriod),
    staleTime: 10000,
    refetchInterval: 15000 // auto poll every 15s
  });

  // Real-time socket events invalidation
  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket) return;

      const handleLiveUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-overview'] });
      };

      socket.on('NEW_PRINT_JOB', handleLiveUpdate);
      socket.on('PRINT_JOB_STATUS_CHANGED', handleLiveUpdate);
      socket.on('TRANSACTION_SUCCESS', handleLiveUpdate);
      socket.on('PRINTER_STATUS_CHANGED', handleLiveUpdate);

      return () => {
        socket.off('NEW_PRINT_JOB', handleLiveUpdate);
        socket.off('PRINT_JOB_STATUS_CHANGED', handleLiveUpdate);
        socket.off('TRANSACTION_SUCCESS', handleLiveUpdate);
        socket.off('PRINTER_STATUS_CHANGED', handleLiveUpdate);
      };
    } catch {
      // socket not connected yet, polling handles it
    }
  }, [queryClient]);

  const stats: AdminStatCardItem[] = overviewData?.stats || [];
  const revenueData: RevenueOverviewData = overviewData?.revenueData || defaultRevenue;
  const liveActivities: LivePrintActivityItem[] = overviewData?.liveActivities || [];
  const topStores: TopPerformingStoreItem[] = overviewData?.topStores || [];
  const transactions: DashboardTransactionItem[] = overviewData?.transactions || [];
  const analytics: PlatformAnalyticsData = overviewData?.analytics || defaultAnalytics;
  const alerts: SystemAlertItem[] = overviewData?.alerts || [];
  const recentUsers: RecentUserItem[] = overviewData?.recentUsers || [];

  return {
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    revenuePeriod,
    setRevenuePeriod,
    analyticsPeriod,
    setAnalyticsPeriod,
    isNotificationOpen,
    setIsNotificationOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    stats,
    isLoading,
    isError,
    error,
    refetch,
    revenueData,
    liveActivities,
    topStores,
    transactions,
    analytics,
    alerts,
    recentUsers
  };
};

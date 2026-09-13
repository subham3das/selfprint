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
import { getSocket, joinAdminRoom } from '@/lib/socket';

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

  // 1. Initial Dashboard Overview Fetch (NO POLLING - 100% Event Driven)
  const {
    data: overviewData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-dashboard-overview', revenuePeriod, analyticsPeriod],
    queryFn: () => adminDashboardService.fetchOverview(revenuePeriod, analyticsPeriod),
    staleTime: Infinity,
    refetchOnWindowFocus: false
  });

  // 2. Real-time Socket.IO event listeners
  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket) return;

      joinAdminRoom();

      const handleSocketUpdate = (eventName: string, data?: any) => {
        console.log(`[Dashboard] state updated from socket: ${eventName}`, data);
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-overview'] });
      };

      const onQueueCreated = (d: any) => handleSocketUpdate('queue:created', d);
      const onQueueStarted = (d: any) => handleSocketUpdate('queue:started', d);
      const onQueueCompleted = (d: any) => handleSocketUpdate('queue:completed', d);
      const onQueueFailed = (d: any) => handleSocketUpdate('queue:failed', d);
      const onQueueCancelled = (d: any) => handleSocketUpdate('queue:cancelled', d);
      const onConnectorConnected = (d: any) => handleSocketUpdate('connector:connected', d);
      const onConnectorDisconnected = (d: any) => handleSocketUpdate('connector:disconnected', d);
      const onConnectorHeartbeat = (d: any) => handleSocketUpdate('connector:heartbeat', d);
      const onPrinterUpdated = (d: any) => handleSocketUpdate('printer:updated', d);
      const onStoreUpdated = (d: any) => handleSocketUpdate('store:updated', d);
      const onPaymentUpdated = (d: any) => handleSocketUpdate('payment:updated', d);
      const onSettlementCreated = (d: any) => handleSocketUpdate('settlement:created', d);

      // Structured events
      socket.on('queue:created', onQueueCreated);
      socket.on('queue:started', onQueueStarted);
      socket.on('queue:completed', onQueueCompleted);
      socket.on('queue:failed', onQueueFailed);
      socket.on('queue:cancelled', onQueueCancelled);
      socket.on('connector:connected', onConnectorConnected);
      socket.on('connector:disconnected', onConnectorDisconnected);
      socket.on('connector:heartbeat', onConnectorHeartbeat);
      socket.on('printer:updated', onPrinterUpdated);
      socket.on('store:updated', onStoreUpdated);
      socket.on('store:block', onStoreUpdated);
      socket.on('store:unblock', onStoreUpdated);
      socket.on('payment:updated', onPaymentUpdated);
      socket.on('settlement:created', onSettlementCreated);

      // Legacy compatibility
      socket.on('NEW_PRINT_JOB', onQueueCreated);
      socket.on('PRINT_JOB_STATUS_CHANGED', onQueueCompleted);
      socket.on('TRANSACTION_SUCCESS', onPaymentUpdated);
      socket.on('PRINTER_STATUS_CHANGED', onPrinterUpdated);

      return () => {
        socket.off('queue:created', onQueueCreated);
        socket.off('queue:started', onQueueStarted);
        socket.off('queue:completed', onQueueCompleted);
        socket.off('queue:failed', onQueueFailed);
        socket.off('queue:cancelled', onQueueCancelled);
        socket.off('connector:connected', onConnectorConnected);
        socket.off('connector:disconnected', onConnectorDisconnected);
        socket.off('connector:heartbeat', onConnectorHeartbeat);
        socket.off('printer:updated', onPrinterUpdated);
        socket.off('store:updated', onStoreUpdated);
        socket.off('store:block', onStoreUpdated);
        socket.off('store:unblock', onStoreUpdated);
        socket.off('payment:updated', onPaymentUpdated);
        socket.off('settlement:created', onSettlementCreated);

        socket.off('NEW_PRINT_JOB', onQueueCreated);
        socket.off('PRINT_JOB_STATUS_CHANGED', onQueueCompleted);
        socket.off('TRANSACTION_SUCCESS', onPaymentUpdated);
        socket.off('PRINTER_STATUS_CHANGED', onPrinterUpdated);
      };
    } catch {
      // socket init handled
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

export default useAdminDashboard;

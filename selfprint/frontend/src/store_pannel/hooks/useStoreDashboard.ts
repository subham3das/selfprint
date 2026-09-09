import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storeDashboardService } from '../services/storeDashboard.service';
import { storeAuthService } from '../services/storeAuth.service';
import { QueueTab } from '../types/dashboard.types';

export const useStoreDashboard = (storeId?: string, selectedQueueTab: QueueTab = 'All') => {
  const [refreshCountdown, setRefreshCountdown] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const token = storeAuthService.getStoredToken();
  const hasAuth = !!token;

  // 1. Dashboard Overview Query (Only enabled when authenticated)
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
    isFetching: isDashboardFetching
  } = useQuery({
    queryKey: ['store-dashboard', storeId],
    queryFn: () => storeDashboardService.getDashboardOverview(storeId),
    enabled: hasAuth,
    refetchInterval: hasAuth ? 10000 : false,
    staleTime: 5000
  });

  // 2. Queue Query (Only enabled when authenticated)
  const {
    data: queueData,
    isLoading: isQueueLoading,
    refetch: refetchQueue
  } = useQuery({
    queryKey: ['store-queue', storeId, selectedQueueTab],
    queryFn: () => storeDashboardService.getRecentQueue(storeId, selectedQueueTab, 1, 8),
    enabled: hasAuth,
    refetchInterval: hasAuth ? 10000 : false,
    staleTime: 5000
  });

  // 3. Notifications Query (Only enabled when authenticated)
  const {
    data: notificationsData,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['store-notifications', storeId],
    queryFn: () => storeDashboardService.getNotifications(storeId, 5),
    enabled: hasAuth,
    refetchInterval: hasAuth ? 15000 : false,
    staleTime: 10000
  });

  // Synchronized countdown ticker for the 10-second auto-refresh indicator
  useEffect(() => {
    if (!hasAuth) return;

    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          setIsRefreshing(true);
          setTimeout(() => setIsRefreshing(false), 800);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasAuth]);

  const handleManualRefresh = async () => {
    if (!hasAuth) return;
    setIsRefreshing(true);
    await Promise.all([refetchDashboard(), refetchQueue(), refetchNotifications()]);
    setRefreshCountdown(10);
    setIsRefreshing(false);
  };

  return {
    dashboardData,
    queueJobs: queueData?.jobs ?? dashboardData?.recentQueue ?? [],
    queueTotal: queueData?.total ?? dashboardData?.recentQueue?.length ?? 0,
    notifications: notificationsData?.notifications ?? [],
    unreadCount: notificationsData?.unreadCount ?? dashboardData?.notificationsCount ?? 0,
    isLoading: isDashboardLoading && !dashboardData,
    isQueueLoading,
    isError: isDashboardError,
    error: dashboardError,
    isFetching: isDashboardFetching || isRefreshing,
    refreshCountdown,
    refetchAll: handleManualRefresh
  };
};

export default useStoreDashboard;

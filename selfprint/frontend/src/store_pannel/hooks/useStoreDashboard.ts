import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { storeDashboardService } from '../services/storeDashboard.service';
import { storeAuthService } from '../services/storeAuth.service';
import { QueueTab } from '../types/dashboard.types';
import { getSocket, joinStoreRoom } from '@/lib/socket';

export const useStoreDashboard = (storeId?: string, selectedQueueTab: QueueTab = 'All') => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const token = storeAuthService.getStoredToken();
  const hasAuth = !!token;

  // 1. Dashboard Overview Query (Fetched once on mount, updated purely via WebSockets)
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
    refetchInterval: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false
  });

  // 2. Queue Query (Fetched once, updated purely via WebSockets)
  const {
    data: queueData,
    isLoading: isQueueLoading,
    refetch: refetchQueue
  } = useQuery({
    queryKey: ['store-queue', storeId, selectedQueueTab],
    queryFn: () => storeDashboardService.getRecentQueue(storeId, selectedQueueTab, 1, 8),
    enabled: hasAuth,
    refetchInterval: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false
  });

  // 3. Notifications Query (Fetched once, updated purely via WebSockets)
  const {
    data: notificationsData,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['store-notifications', storeId],
    queryFn: () => storeDashboardService.getNotifications(storeId, 5),
    enabled: hasAuth,
    refetchInterval: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false
  });

  // 4. Real-Time Socket.IO Subscriptions (Zero Polling Architecture)
  useEffect(() => {
    if (!hasAuth) return;

    try {
      const socket = getSocket();
      if (!socket) return;

      if (storeId) {
        joinStoreRoom(storeId);
      }

      const updateDashboardCache = (event: string, data?: any) => {
        console.log(`[Dashboard] state updated from socket: ${event}`, data);
        
        // Mutate dashboard state directly for zero REST roundtrips where possible
        if (event.startsWith('connector:') || event.startsWith('heartbeat') || event.startsWith('printer:')) {
          queryClient.setQueryData(['store-dashboard', storeId], (prev: any) => {
            if (!prev) return prev;
            const updated = { ...prev };
            if (data?.status) {
              updated.connectorStatus = data.status === 'ONLINE' ? 'Online' : 'Offline';
            }
            if (data?.printerCount !== undefined) {
              updated.connectedPrintersCount = data.printerCount;
            }
            if (data?.lastHeartbeat) {
              updated.lastHeartbeat = data.lastHeartbeat;
            }
            return updated;
          });
        }

        // Refetch queue or notifications cleanly without loop
        if (event.startsWith('queue:') || event === 'NEW_PRINT_JOB' || event === 'queue_changed') {
          queryClient.invalidateQueries({ queryKey: ['store-queue', storeId] });
          queryClient.invalidateQueries({ queryKey: ['store-dashboard', storeId] });
        }
        if (event.startsWith('notification:') || event === 'notification') {
          queryClient.invalidateQueries({ queryKey: ['store-notifications', storeId] });
        }
      };

      // Register structured real-time events
      socket.on('connector:connected', (d) => updateDashboardCache('connector:connected', d));
      socket.on('connector:disconnected', (d) => updateDashboardCache('connector:disconnected', d));
      socket.on('connector:heartbeat', (d) => updateDashboardCache('connector:heartbeat', d));
      socket.on('connector:updated', (d) => updateDashboardCache('connector:updated', d));
      socket.on('printer:updated', (d) => updateDashboardCache('printer:updated', d));
      socket.on('printer:added', (d) => updateDashboardCache('printer:added', d));
      socket.on('printer:removed', (d) => updateDashboardCache('printer:removed', d));
      socket.on('queue:created', (d) => updateDashboardCache('queue:created', d));
      socket.on('queue:started', (d) => updateDashboardCache('queue:started', d));
      socket.on('queue:completed', (d) => updateDashboardCache('queue:completed', d));
      socket.on('queue:failed', (d) => updateDashboardCache('queue:failed', d));
      socket.on('queue:cancelled', (d) => updateDashboardCache('queue:cancelled', d));
      socket.on('queue:status', (d) => updateDashboardCache('queue:status', d));
      socket.on('notification:new', (d) => updateDashboardCache('notification:new', d));
      socket.on('store:testModeChanged', () => {
        queryClient.invalidateQueries({ queryKey: ['store-dashboard', storeId] });
        queryClient.invalidateQueries({ queryKey: ['storeFullSettings'] });
      });
      socket.on('test_mode_changed', () => {
        queryClient.invalidateQueries({ queryKey: ['store-dashboard', storeId] });
        queryClient.invalidateQueries({ queryKey: ['storeFullSettings'] });
      });

      // Legacy fallback listeners
      socket.on('heartbeat', (d) => updateDashboardCache('heartbeat', d));
      socket.on('connector_connected', (d) => updateDashboardCache('connector_connected', d));
      socket.on('connector_disconnected', (d) => updateDashboardCache('connector_disconnected', d));
      socket.on('printers_updated', (d) => updateDashboardCache('printers_updated', d));
      socket.on('NEW_PRINT_JOB', (d) => updateDashboardCache('NEW_PRINT_JOB', d));
      socket.on('queue_changed', (d) => updateDashboardCache('queue_changed', d));
      socket.on('notification', (d) => updateDashboardCache('notification', d));

      return () => {
        socket.off('connector:connected');
        socket.off('connector:disconnected');
        socket.off('connector:heartbeat');
        socket.off('connector:updated');
        socket.off('printer:updated');
        socket.off('printer:added');
        socket.off('printer:removed');
        socket.off('queue:created');
        socket.off('queue:started');
        socket.off('queue:completed');
        socket.off('queue:failed');
        socket.off('queue:cancelled');
        socket.off('queue:status');
        socket.off('notification:new');
        socket.off('store:testModeChanged');
        socket.off('test_mode_changed');

        socket.off('heartbeat');
        socket.off('connector_connected');
        socket.off('connector_disconnected');
        socket.off('printers_updated');
        socket.off('NEW_PRINT_JOB');
        socket.off('queue_changed');
        socket.off('notification');
      };
    } catch (err) {
      console.error('[Dashboard] Socket setup error:', err);
    }
  }, [hasAuth, storeId, queryClient]);

  const handleManualRefresh = async () => {
    if (!hasAuth) return;
    setIsRefreshing(true);
    await Promise.all([refetchDashboard(), refetchQueue(), refetchNotifications()]);
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
    refreshCountdown: 0,
    refetchAll: handleManualRefresh
  };
};

export default useStoreDashboard;

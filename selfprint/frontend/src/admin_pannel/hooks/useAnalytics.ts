import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AnalyticsPeriod,
  AdminAnalyticsDashboardResponse
} from '../types/analytics.types';
import { adminAnalyticsService } from '../services/analytics.service';
import { getSocket } from '@/lib/socket';

const defaultDashboard: AdminAnalyticsDashboardResponse = {
  period: 'Month',
  stats: {
    totalPrintJobs: 0,
    totalPagesPrinted: 0,
    avgPrintTime: '--',
    printerEfficiency: '--',
    peakUsageTime: '--',
    systemUptime: '--',
    cards: [
      { id: 'print-jobs', title: 'Total Print Jobs Today', value: '0', comparisonText: '—', isPositive: true, sparkline: [0, 0, 0, 0], color: '#6366F1' },
      { id: 'pages-printed', title: 'Total Pages Printed', value: '0', comparisonText: '—', isPositive: true, sparkline: [0, 0, 0, 0], color: '#10B981' },
      { id: 'avg-print-time', title: 'Average Print Time', value: '--', comparisonText: '—', isPositive: true, sparkline: [0, 0, 0, 0], color: '#F59E0B' },
      { id: 'printer-efficiency', title: 'Printer Efficiency', value: '--', comparisonText: 'No jobs recorded', isPositive: false, sparkline: [0, 0, 0, 0], color: '#0EA5E9' },
      { id: 'peak-usage-time', title: 'Peak Usage Time', value: '--', comparisonText: 'No jobs recorded', isPositive: false, sparkline: [0, 0, 0, 0], color: '#F43F5E' },
      { id: 'system-uptime', title: 'System Uptime', value: '--', comparisonText: 'No hardware online', isPositive: false, sparkline: [0, 0, 0, 0], color: '#6366F1' }
    ]
  },
  printingActivity: [],
  platformHealth: {
    overallHealthPercent: 100,
    serverHealth: 99,
    apiStatus: 'Online',
    databaseStatus: 'Healthy',
    storageUsedPercent: 0,
    activeConnections: 0,
    todaysErrors: 0
  },
  heatmapCells: [],
  topStores: [],
  paperUsage: [],
  printTypeSegments: [],
  printerStatusSegments: [],
  platformEvents: [],
  quickInsights: [
    { id: 'best-store', title: 'Best Performing Store', value: 'Not enough data', subtitle: 'No orders', iconType: 'shield' },
    { id: 'highest-rev', title: 'Highest Revenue Store', value: 'Not enough data', subtitle: '₹0', iconType: 'trending' },
    { id: 'active-user', title: 'Most Active User', value: 'Not enough data', subtitle: 'No user jobs', iconType: 'user' },
    { id: 'avg-queue', title: 'Average Queue Time', value: '1.2 mins', subtitle: 'Optimal latency', iconType: 'queue' },
    { id: 'avg-wait', title: 'Average Wait Time', value: '3.4 mins', subtitle: 'Normal flow', iconType: 'wait' },
    { id: 'avg-pages', title: 'Average Pages per Job', value: 'Not enough data', subtitle: 'Standard document size', iconType: 'pages' },
    { id: 'peak-hour', title: 'Peak Printing Hour', value: '--', subtitle: 'Operating hours', iconType: 'peak' },
    { id: 'platform-growth', title: 'Total Platform Revenue', value: '₹0', subtitle: 'Gross payment volume', iconType: 'growth' }
  ]
};

export const useAnalytics = () => {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<AnalyticsPeriod>('Month');

  // 1. Fetch Analytics Dashboard
  const {
    data: dashboardData = defaultDashboard,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-analytics-dashboard', period],
    queryFn: () => adminAnalyticsService.fetchDashboard(period),
    staleTime: 15000
  });

  // 2. Real-Time Socket.io Synchronization
  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket) return;

      const handleLiveUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-analytics-dashboard'] });
      };

      socket.on('PRINT_JOB_STATUS_CHANGED', handleLiveUpdate);
      socket.on('PRINTER_STATUS_CHANGED', handleLiveUpdate);

      return () => {
        socket.off('PRINT_JOB_STATUS_CHANGED', handleLiveUpdate);
        socket.off('PRINTER_STATUS_CHANGED', handleLiveUpdate);
      };
    } catch {
      // Socket not ready
    }
  }, [queryClient]);

  return {
    period,
    setPeriod,
    stats: dashboardData.stats || defaultDashboard.stats,
    printingActivity: dashboardData.printingActivity || [],
    platformHealth: dashboardData.platformHealth || defaultDashboard.platformHealth,
    heatmapCells: dashboardData.heatmapCells || [],
    topStores: dashboardData.topStores || [],
    paperUsage: dashboardData.paperUsage || [],
    printTypeSegments: dashboardData.printTypeSegments || [],
    printerStatusSegments: dashboardData.printerStatusSegments || [],
    platformEvents: dashboardData.platformEvents || [],
    quickInsights: dashboardData.quickInsights || defaultDashboard.quickInsights,
    isLoading,
    isError,
    error,
    refetch
  };
};

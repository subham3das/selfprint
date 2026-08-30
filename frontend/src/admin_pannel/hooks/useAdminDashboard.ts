import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ADMIN_STAT_CARDS,
  ADMIN_REVENUE_OVERVIEW,
  LIVE_PRINT_ACTIVITIES,
  TOP_PERFORMING_STORES,
  RECENT_TRANSACTIONS,
  PLATFORM_ANALYTICS,
  SYSTEM_ALERTS,
  RECENT_USERS
} from '../data/adminMockData';

export const useAdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('29 May 2025');
  const [revenuePeriod, setRevenuePeriod] = useState<'This Week' | 'This Month' | 'This Year'>('This Week');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'This Month' | 'This Year'>('This Month');
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // TanStack Query simulation for dashboard stats
  const { data: stats = ADMIN_STAT_CARDS, isLoading: isStatsLoading } = useQuery({
    queryKey: ['admin-stats', selectedDate],
    queryFn: async () => {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 50));
      return ADMIN_STAT_CARDS;
    },
    staleTime: 60000
  });

  // Revenue Query
  const { data: revenueData = ADMIN_REVENUE_OVERVIEW, isLoading: isRevenueLoading } = useQuery({
    queryKey: ['admin-revenue', revenuePeriod],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return ADMIN_REVENUE_OVERVIEW;
    },
    staleTime: 60000
  });

  // Live Print Activity Query
  const { data: liveActivities = LIVE_PRINT_ACTIVITIES } = useQuery({
    queryKey: ['admin-live-activities'],
    queryFn: async () => {
      return LIVE_PRINT_ACTIVITIES;
    },
    refetchInterval: 15000 // auto-refresh simulation
  });

  // Top Performing Stores Query
  const { data: topStores = TOP_PERFORMING_STORES } = useQuery({
    queryKey: ['admin-top-stores'],
    queryFn: async () => TOP_PERFORMING_STORES
  });

  // Recent Transactions Query
  const { data: transactions = RECENT_TRANSACTIONS } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => RECENT_TRANSACTIONS
  });

  // Platform Analytics Query
  const { data: analytics = PLATFORM_ANALYTICS } = useQuery({
    queryKey: ['admin-analytics', analyticsPeriod],
    queryFn: async () => PLATFORM_ANALYTICS
  });

  // System Alerts Query
  const { data: alerts = SYSTEM_ALERTS } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async () => SYSTEM_ALERTS
  });

  // Recent Users Query
  const { data: recentUsers = RECENT_USERS } = useQuery({
    queryKey: ['admin-recent-users'],
    queryFn: async () => RECENT_USERS
  });

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
    isStatsLoading,
    revenueData,
    isRevenueLoading,
    liveActivities,
    topStores,
    transactions,
    analytics,
    alerts,
    recentUsers
  };
};

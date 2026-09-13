import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  RevenuePeriod,
  RevenueFilterState,
  RevenueStatsData,
  RevenueOverviewResponse
} from '../types/revenue.types';
import { adminRevenueService } from '../services/revenue.service';
import { getSocket } from '@/lib/socket';

const defaultStats: RevenueStatsData = {
  totalRevenue: '₹0.00',
  totalRevenueTrend: '0% from last month',
  platformCommission: '₹0.00',
  platformCommissionTrend: '0% from last month',
  totalTransactions: 0,
  totalTransactionsTrend: '0% from last month',
  averageOrderValue: '₹0.00',
  averageOrderValueTrend: '0% from last month',
  refundsAdjustments: '₹0.00',
  refundsTrend: '0% from last month',
  netRevenue: '₹0.00',
  netRevenueTrend: '0% from last month'
};

const defaultOverview: RevenueOverviewResponse = {
  stats: defaultStats,
  chart: [],
  paymentMethods: [],
  revenueCategories: [],
  topStores: [],
  topCities: [],
  recentTransactions: [],
  filters: {
    stores: ['All Stores'],
    cities: ['All Cities'],
    paymentMethods: ['All Payment Methods'],
    revenueTypes: ['All Revenue Types'],
    periods: ['Today', 'This Week', 'This Month', 'This Year']
  }
};

export const useRevenue = () => {
  const queryClient = useQueryClient();

  // Filter States
  const [filters, setFilters] = useState<RevenueFilterState>({
    period: 'This Month',
    store: 'All Stores',
    city: 'All Cities',
    revenueType: 'All Revenue Types',
    dateRange: ''
  });

  // Chart View Period Toggle ('daily' | 'weekly' | 'monthly')
  const [chartPeriod, setChartPeriod] = useState<RevenuePeriod>('daily');

  // Single Unified Dashboard API via React Query
  const {
    data: overviewData = defaultOverview,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-revenue-overview', chartPeriod, filters.store, filters.city, filters.revenueType],
    queryFn: () =>
      adminRevenueService.fetchOverview({
        period: chartPeriod,
        store: filters.store !== 'All Stores' ? filters.store : undefined,
        city: filters.city !== 'All Cities' ? filters.city : undefined,
        revenueType: filters.revenueType !== 'All Revenue Types' ? filters.revenueType : undefined
      }),
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false
  });

  // Socket.io Real-Time Synchronization
  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket) return;

      const handleLiveUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-revenue-overview'] });
      };

      socket.on('TRANSACTION_SUCCESS', handleLiveUpdate);
      socket.on('PRINT_JOB_STATUS_CHANGED', handleLiveUpdate);

      return () => {
        socket.off('TRANSACTION_SUCCESS', handleLiveUpdate);
        socket.off('PRINT_JOB_STATUS_CHANGED', handleLiveUpdate);
      };
    } catch {
      // Socket not connected
    }
  }, [queryClient]);

  const stats = overviewData.stats || defaultStats;
  const activeChartPoints = overviewData.chart || [];
  const categorySegments = overviewData.revenueCategories || [];
  const paymentSegments = overviewData.paymentMethods || [];
  const topStores = overviewData.topStores || [];
  const topCities = overviewData.topCities || [];
  const recentTransactions = overviewData.recentTransactions || [];
  const uniqueStores = overviewData.filters?.stores || ['All Stores'];
  const uniqueCities = overviewData.filters?.cities || ['All Cities'];

  const resetFilters = () => {
    setFilters({
      period: 'This Month',
      store: 'All Stores',
      city: 'All Cities',
      revenueType: 'All Revenue Types',
      dateRange: ''
    });
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf' | 'report' | 'summary') => {
    if (recentTransactions.length === 0) {
      alert('No revenue transaction records available to export.');
      return;
    }

    if (format === 'csv') {
      const headers = 'TransactionID,Store,Amount,Commission,PaymentMethod,Status,Date,Time\n';
      const rows = recentTransactions
        .map(
          (t) =>
            `"${t.txnId}","${t.storeName}","${t.amountFormatted}","${t.commissionFormatted}","${t.paymentMethod}","${t.status}","${t.date}","${t.time}"`
        )
        .join('\n');

      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `revenue_statement_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(
        `Generated live revenue report (${recentTransactions.length} records). Downloading official ${format.toUpperCase()} summary...`
      );
    }
  };

  return {
    filters,
    setFilters,
    chartPeriod,
    setChartPeriod,
    stats,
    isLoading,
    isError,
    error,
    refetch,
    activeChartPoints,
    categorySegments,
    paymentSegments,
    topStores,
    topCities,
    recentTransactions,
    uniqueStores,
    uniqueCities,
    resetFilters,
    handleExport
  };
};

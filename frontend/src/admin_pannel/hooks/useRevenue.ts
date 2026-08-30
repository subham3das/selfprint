import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  RevenuePeriod,
  RevenueFilterState
} from '../types/revenue.types';
import {
  REVENUE_STATS_MOCK,
  DAILY_REVENUE_CHART_POINTS,
  WEEKLY_REVENUE_CHART_POINTS,
  MONTHLY_REVENUE_CHART_POINTS,
  CATEGORY_REVENUE_SEGMENTS,
  PAYMENT_METHOD_REVENUE_SEGMENTS,
  TOP_PERFORMING_STORES_REVENUE,
  TOP_CITIES_REVENUE,
  RECENT_REVENUE_TRANSACTIONS
} from '../data/revenue.mock';

export const useRevenue = () => {
  // Filter States
  const [filters, setFilters] = useState<RevenueFilterState>({
    period: 'This Month',
    store: 'All Stores',
    city: 'All Cities',
    revenueType: 'All Revenue Types',
    dateRange: '01 May 2025 - 29 May 2025'
  });

  // Chart View Period Toggle ('daily' | 'weekly' | 'monthly')
  const [chartPeriod, setChartPeriod] = useState<RevenuePeriod>('daily');

  // TanStack Query Mock loader
  const { data: stats = REVENUE_STATS_MOCK, isLoading } = useQuery({
    queryKey: ['admin-revenue-stats'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 40));
      return REVENUE_STATS_MOCK;
    },
    staleTime: 60000
  });

  // Selected chart points based on period
  const activeChartPoints = useMemo(() => {
    switch (chartPeriod) {
      case 'daily':
        return DAILY_REVENUE_CHART_POINTS;
      case 'weekly':
        return WEEKLY_REVENUE_CHART_POINTS;
      case 'monthly':
        return MONTHLY_REVENUE_CHART_POINTS;
      default:
        return DAILY_REVENUE_CHART_POINTS;
    }
  }, [chartPeriod]);

  // Unique stores & cities for dropdowns
  const uniqueStores = useMemo(() => {
    return [
      'All Stores',
      'Print Hub Dibrugarh',
      'Print Zone Guwahati',
      'Copy Center Jorhat',
      'Docu Print Silchar',
      'Easy Print Tezpur',
      'Print Point Shillong',
      'City Print Nagaon',
      'Mega Print Tinsukia'
    ];
  }, []);

  const uniqueCities = useMemo(() => {
    return [
      'All Cities',
      'Guwahati',
      'Dibrugarh',
      'Jorhat',
      'Silchar',
      'Tezpur',
      'Shillong',
      'Nagaon',
      'Tinsukia'
    ];
  }, []);

  const resetFilters = () => {
    setFilters({
      period: 'This Month',
      store: 'All Stores',
      city: 'All Cities',
      revenueType: 'All Revenue Types',
      dateRange: '01 May 2025 - 29 May 2025'
    });
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf' | 'report' | 'summary') => {
    alert(`Generating official ${format.toUpperCase()} Revenue Statement & Monthly Audit Report...`);
  };

  return {
    filters,
    setFilters,
    chartPeriod,
    setChartPeriod,
    stats,
    isLoading,
    activeChartPoints,
    categorySegments: CATEGORY_REVENUE_SEGMENTS,
    paymentSegments: PAYMENT_METHOD_REVENUE_SEGMENTS,
    topStores: TOP_PERFORMING_STORES_REVENUE,
    topCities: TOP_CITIES_REVENUE,
    recentTransactions: RECENT_REVENUE_TRANSACTIONS,
    uniqueStores,
    uniqueCities,
    resetFilters,
    handleExport
  };
};

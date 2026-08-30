import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsPeriod } from '../types/analytics.types';
import {
  ANALYTICS_STATS_MOCK,
  PRINTING_ACTIVITY_DAY,
  PRINTING_ACTIVITY_WEEK,
  PRINTING_ACTIVITY_MONTH,
  PLATFORM_HEALTH_MOCK,
  generateHeatmapMock,
  TOP_10_ANALYTICS_STORES,
  PAPER_USAGE_STATS,
  PRINT_TYPE_SEGMENTS,
  PRINTER_STATUS_SEGMENTS,
  RECENT_PLATFORM_EVENTS,
  QUICK_INSIGHTS_MOCK
} from '../data/analytics.mock';

export const useAnalytics = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('Day');
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const [selectedCity, setSelectedCity] = useState('All Cities');

  const { data: stats = ANALYTICS_STATS_MOCK, refetch, isFetching } = useQuery({
    queryKey: ['admin-analytics-stats', period, selectedStore, selectedCity],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 50));
      return ANALYTICS_STATS_MOCK;
    },
    staleTime: 60000
  });

  const printingActivity = useMemo(() => {
    switch (period) {
      case 'Week':
        return PRINTING_ACTIVITY_WEEK;
      case 'Month':
      case 'Year':
        return PRINTING_ACTIVITY_MONTH;
      case 'Day':
      default:
        return PRINTING_ACTIVITY_DAY;
    }
  }, [period]);

  const heatmapCells = useMemo(() => generateHeatmapMock(), []);

  const handleExport = (format: 'CSV' | 'Excel' | 'PDF' | 'Analytics Report') => {
    alert(`Exporting Super Admin Analytics report in ${format} format...`);
  };

  const handleRefresh = () => {
    refetch();
  };

  return {
    period,
    setPeriod,
    selectedStore,
    setSelectedStore,
    selectedCity,
    setSelectedCity,
    stats,
    printingActivity,
    platformHealth: PLATFORM_HEALTH_MOCK,
    heatmapCells,
    topStores: TOP_10_ANALYTICS_STORES,
    paperUsage: PAPER_USAGE_STATS,
    printTypeSegments: PRINT_TYPE_SEGMENTS,
    printerStatusSegments: PRINTER_STATUS_SEGMENTS,
    platformEvents: RECENT_PLATFORM_EVENTS,
    quickInsights: QUICK_INSIGHTS_MOCK,
    isFetching,
    handleExport,
    handleRefresh
  };
};

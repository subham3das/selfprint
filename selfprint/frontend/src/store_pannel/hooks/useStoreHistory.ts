import { useQuery, useMutation } from '@tanstack/react-query';
import {
  storeHistoryService,
  FetchTransactionsParams,
  FetchTransactionsResponse
} from '../services/storeHistory.service';
import {
  TransactionFilters,
  FinancialSummary,
  DailyIncomePoint,
  PaymentBreakdownItem
} from '../types/transaction.types';

export const useStoreHistory = (
  params?: FetchTransactionsParams,
  chartPeriod = 'Last 7 Days',
  summaryRange = 'today'
) => {
  const token = localStorage.getItem('selfprint_store_token');
  const isEnabled = Boolean(token);

  // 1. Transactions List Query
  const transactionsQuery = useQuery<FetchTransactionsResponse>({
    queryKey: ['storeTransactions', params],
    queryFn: () => storeHistoryService.fetchTransactions(params),
    enabled: isEnabled,
    staleTime: 5000
  });

  // 2. Financial Summary Query
  const summaryQuery = useQuery<FinancialSummary>({
    queryKey: ['storeFinancialSummary', summaryRange],
    queryFn: () => storeHistoryService.fetchSummary(summaryRange),
    enabled: isEnabled,
    staleTime: 5000
  });

  // 3. Income Chart Query
  const incomeChartQuery = useQuery<DailyIncomePoint[]>({
    queryKey: ['storeIncomeChart', chartPeriod],
    queryFn: () => storeHistoryService.fetchIncomeChart(chartPeriod),
    enabled: isEnabled,
    staleTime: 5000
  });

  // 4. Payment Breakdown Query
  const paymentBreakdownQuery = useQuery<PaymentBreakdownItem[]>({
    queryKey: ['storePaymentBreakdown', summaryRange],
    queryFn: () => storeHistoryService.fetchPaymentBreakdown(summaryRange),
    enabled: isEnabled,
    staleTime: 5000
  });

  // 5. Export Mutation
  const exportMutation = useMutation({
    mutationFn: (filters?: TransactionFilters) =>
      storeHistoryService.exportTransactionsCsv(filters)
  });

  const refetchAll = async () => {
    await Promise.all([
      transactionsQuery.refetch(),
      summaryQuery.refetch(),
      incomeChartQuery.refetch(),
      paymentBreakdownQuery.refetch()
    ]);
  };

  return {
    transactions: transactionsQuery.data?.transactions || [],
    totalTransactions: transactionsQuery.data?.total || 0,
    pagination: transactionsQuery.data?.pagination || {
      page: params?.page || 1,
      limit: params?.limit || 10,
      total: 0,
      totalPages: 1
    },
    summary: summaryQuery.data || {
      totalTransactions: 0,
      totalTransactionsChangePercent: 0,
      totalRevenue: 0,
      totalRevenueChangePercent: 0,
      cashReceived: 0,
      upiReceived: 0,
      cardReceived: 0,
      avgOrderValue: 0,
      refundsTotal: 0,
      pendingPaymentsTotal: 0,
      period: 'Today'
    },
    incomeData: incomeChartQuery.data || [],
    paymentBreakdown: paymentBreakdownQuery.data || [],
    isLoading:
      transactionsQuery.isLoading ||
      summaryQuery.isLoading ||
      incomeChartQuery.isLoading,
    isFetching:
      transactionsQuery.isFetching ||
      summaryQuery.isFetching ||
      incomeChartQuery.isFetching,
    refetchAll,
    exportTransactions: exportMutation.mutateAsync,
    isExporting: exportMutation.isPending
  };
};

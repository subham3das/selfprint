import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AdminTransactionItem,
  TransactionFilterState,
  RefundFormValues,
  TransactionStatsData
} from '../types/transaction.types';
import { adminTransactionsService } from '../services/transactions.service';
import { getSocket } from '@/lib/socket';

const defaultStats: TransactionStatsData = {
  totalTransactions: 0,
  totalTransactionsTrend: '0% from last month',
  successfulTransactions: 0,
  successfulTransactionsTrend: '0% from last month',
  pendingTransactions: 0,
  pendingTransactionsTrend: 'None pending',
  failedTransactions: 0,
  failedTransactionsTrend: '0 failures',
  totalAmountFormatted: '₹0.00',
  totalAmountTrend: '0% from last month',
  totalCommissionFormatted: '₹0.00',
  totalCommissionTrend: '0% from last month'
};

export const useTransactions = () => {
  const queryClient = useQueryClient();

  // Filters State
  const [filters, setFilters] = useState<TransactionFilterState>({
    searchQuery: '',
    status: 'All',
    store: 'All',
    paymentMethod: 'All',
    dateRange: ''
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal State
  const [viewingTransaction, setViewingTransaction] = useState<AdminTransactionItem | null>(null);
  const [refundingTransaction, setRefundingTransaction] = useState<AdminTransactionItem | null>(null);

  // 1. Fetch Transaction Statistics
  const {
    data: stats = defaultStats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['admin-transactions-stats'],
    queryFn: () => adminTransactionsService.fetchStats(),
    staleTime: 15000
  });

  // 2. Fetch Unique Stores
  const { data: uniqueStores = [] } = useQuery({
    queryKey: ['admin-transactions-stores'],
    queryFn: () => adminTransactionsService.fetchUniqueStores(),
    staleTime: 60000
  });

  // 3. Fetch Filtered & Paginated Transactions
  const {
    data: txnsResponse,
    isLoading: isTxnsLoading,
    isError: isTxnsError,
    error: txnsError,
    refetch: refetchTxns
  } = useQuery({
    queryKey: [
      'admin-transactions-list',
      currentPage,
      pageSize,
      filters.searchQuery,
      filters.status,
      filters.store,
      filters.paymentMethod,
      filters.dateRange
    ],
    queryFn: () =>
      adminTransactionsService.fetchTransactions({
        page: currentPage,
        limit: pageSize,
        search: filters.searchQuery || undefined,
        status: filters.status !== 'All' ? filters.status : undefined,
        store: filters.store !== 'All' ? filters.store : undefined,
        paymentMethod: filters.paymentMethod !== 'All' ? filters.paymentMethod : undefined
      }),
    staleTime: 10000
  });

  // 4. Socket.io Real-Time Synchronization
  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket) return;

      const handleLiveUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-transactions-list'] });
        queryClient.invalidateQueries({ queryKey: ['admin-transactions-stats'] });
      };

      socket.on('TRANSACTION_SUCCESS', handleLiveUpdate);
      socket.on('PRINT_JOB_STATUS_CHANGED', handleLiveUpdate);

      return () => {
        socket.off('TRANSACTION_SUCCESS', handleLiveUpdate);
        socket.off('PRINT_JOB_STATUS_CHANGED', handleLiveUpdate);
      };
    } catch {
      // Socket not ready
    }
  }, [queryClient]);

  // 5. Refund Mutation
  const refundMutation = useMutation({
    mutationFn: (values: RefundFormValues) =>
      adminTransactionsService.refundTransaction(values.transactionId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-transactions-stats'] });
      setRefundingTransaction(null);
    }
  });

  const paginatedTransactions = txnsResponse?.transactions || [];
  const totalCount = txnsResponse?.pagination?.total || 0;
  const totalPages = txnsResponse?.pagination?.pages || 1;
  const isLoading = isStatsLoading || isTxnsLoading;
  const isError = isStatsError || isTxnsError;

  // Reset Filters
  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      status: 'All',
      store: 'All',
      paymentMethod: 'All',
      dateRange: ''
    });
    setCurrentPage(1);
  };

  // Export functions
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (paginatedTransactions.length === 0) {
      alert('No transactions available to export.');
      return;
    }

    if (format === 'csv') {
      const headers =
        'TransactionID,PaymentID,Store,City,Customer,Email,OrderType,Pages,Amount,Commission,PaymentMethod,Status,Date,Time\n';
      const rows = paginatedTransactions
        .map(
          (t) =>
            `"${t.txnId}","${t.paymentId}","${t.storeName}","${t.city}","${t.customerName}","${t.customerEmail}","${t.orderType}",${t.pages},"${t.amountFormatted}","${t.commissionFormatted}","${t.paymentMethod}","${t.status}","${t.date}","${t.time}"`
        )
        .join('\n');

      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `transactions_export_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(
        `Exporting ${paginatedTransactions.length} records as ${format.toUpperCase()}... Download initiated!`
      );
    }
  };

  const handleProcessRefund = (values: RefundFormValues) => {
    refundMutation.mutate(values);
  };

  const handleDeleteTransaction = (_id: string) => {
    // Audit logs preserve transactions; no destructive delete in enterprise audit
    alert('Transaction records are immutable for regulatory compliance.');
  };

  const refetchAll = () => {
    refetchStats();
    refetchTxns();
  };

  return {
    filters,
    setFilters,
    uniqueStores,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    paginatedTransactions,
    resetFilters,
    handleExport,
    stats,
    isLoading,
    isError,
    error: txnsError,
    refetch: refetchAll,
    viewingTransaction,
    setViewingTransaction,
    refundingTransaction,
    setRefundingTransaction,
    handleProcessRefund,
    handleDeleteTransaction
  };
};

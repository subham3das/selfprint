import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AdminTransactionItem,
  TransactionFilterState,
  RefundFormValues
} from '../types/transaction.types';
import { getAllMockTransactions, TRANSACTION_STATS_MOCK } from '../data/transactions.mock';

export const useTransactions = () => {
  // Filters State
  const [filters, setFilters] = useState<TransactionFilterState>({
    searchQuery: '',
    status: 'All',
    store: 'All',
    paymentMethod: 'All',
    dateRange: '01 May 2025 - 29 May 2025'
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal State
  const [viewingTransaction, setViewingTransaction] = useState<AdminTransactionItem | null>(null);
  const [refundingTransaction, setRefundingTransaction] = useState<AdminTransactionItem | null>(null);

  // TanStack Query for transactions data
  const { data: initialTxns = getAllMockTransactions(), isLoading } = useQuery({
    queryKey: ['admin-transactions-list'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 40));
      return getAllMockTransactions();
    },
    staleTime: 60000
  });

  // Local state for mutations
  const [transactionList, setTransactionList] = useState<AdminTransactionItem[]>(initialTxns);

  // Unique stores for dropdown
  const uniqueStores = useMemo(() => {
    const set = new Set<string>();
    transactionList.forEach((t) => set.add(t.storeName));
    return Array.from(set).sort();
  }, [transactionList]);

  // Combined Multi-Filter Engine
  const filteredTransactions = useMemo(() => {
    return transactionList.filter((txn) => {
      // 1. Search Query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesTxnId = txn.txnId.toLowerCase().includes(query);
        const matchesStore = txn.storeName.toLowerCase().includes(query);
        const matchesCustomer = txn.customerName.toLowerCase().includes(query);
        const matchesEmail = txn.customerEmail.toLowerCase().includes(query);
        const matchesAmount = txn.amountFormatted.toLowerCase().includes(query);

        if (
          !matchesTxnId &&
          !matchesStore &&
          !matchesCustomer &&
          !matchesEmail &&
          !matchesAmount
        ) {
          return false;
        }
      }

      // 2. Status Filter
      if (filters.status !== 'All' && txn.status !== filters.status) {
        return false;
      }

      // 3. Store Filter
      if (filters.store !== 'All' && txn.storeName !== filters.store) {
        return false;
      }

      // 4. Payment Method Filter
      if (filters.paymentMethod !== 'All' && txn.paymentMethod !== filters.paymentMethod) {
        return false;
      }

      return true;
    });
  }, [transactionList, filters]);

  // Pagination calculations
  const totalCount = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  // Reset Filters
  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      status: 'All',
      store: 'All',
      paymentMethod: 'All',
      dateRange: '01 May 2025 - 29 May 2025'
    });
    setCurrentPage(1);
  };

  // Export functions
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (format === 'csv') {
      const headers = 'TransactionID,PaymentID,Store,City,Customer,Email,OrderType,Pages,Amount,Commission,PaymentMethod,Status,Date,Time\n';
      const rows = filteredTransactions
        .slice(0, 1000)
        .map(
          (t) =>
            `"${t.txnId}","${t.paymentId}","${t.storeName}","${t.city}","${t.customerName}","${t.customerEmail}","${t.orderType}",${t.pages},"${t.amountFormatted}","${t.commissionFormatted}","${t.paymentMethod}","${t.status}","${t.date}","${t.time}"`
        )
        .join('\n');

      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Exporting ${filteredTransactions.length} records as ${format.toUpperCase()}... Download initiated!`);
    }
  };

  // Mutations
  const handleProcessRefund = (values: RefundFormValues) => {
    setTransactionList((prev) =>
      prev.map((t) =>
        t.txnId === values.transactionId ? { ...t, status: 'Refunded' } : t
      )
    );
    setRefundingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction record?')) {
      setTransactionList((prev) => prev.filter((t) => t.id !== id));
    }
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
    stats: TRANSACTION_STATS_MOCK,
    isLoading,
    viewingTransaction,
    setViewingTransaction,
    refundingTransaction,
    setRefundingTransaction,
    handleProcessRefund,
    handleDeleteTransaction
  };
};

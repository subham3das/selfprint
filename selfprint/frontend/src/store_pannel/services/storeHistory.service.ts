import { apiClient } from '@/lib/axios';
import {
  TransactionItem,
  TransactionFilters,
  FinancialSummary,
  DailyIncomePoint,
  PaymentBreakdownItem
} from '../types/transaction.types';

export interface FetchTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  dateRange?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  colorMode?: string;
  paperSize?: string;
  sortBy?: string;
}

export interface FetchTransactionsResponse {
  transactions: TransactionItem[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const storeHistoryService = {
  /**
   * Fetches paginated & filtered transactions from MongoDB
   */
  async fetchTransactions(params?: FetchTransactionsParams): Promise<FetchTransactionsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.search && params.search.trim()) queryParams.set('search', params.search.trim());
    if (params?.dateRange) queryParams.set('dateRange', params.dateRange);
    if (params?.paymentStatus && params.paymentStatus !== 'All') {
      queryParams.set('paymentStatus', params.paymentStatus);
    }
    if (params?.paymentMethod && params.paymentMethod !== 'All') {
      queryParams.set('paymentMethod', params.paymentMethod);
    }
    if (params?.colorMode && params.colorMode !== 'All') {
      queryParams.set('colorMode', params.colorMode);
    }
    if (params?.paperSize && params.paperSize !== 'All') {
      queryParams.set('paperSize', params.paperSize);
    }
    if (params?.sortBy) queryParams.set('sortBy', params.sortBy);

    const res = await apiClient.get(`/store/history/transactions?${queryParams.toString()}`);
    const data = res.data?.data;
    return {
      transactions: data?.transactions || [],
      total: data?.total || 0,
      pagination: data?.pagination || {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: 0,
        totalPages: 1
      }
    };
  },

  /**
   * Fetches real financial metrics summary
   */
  async fetchSummary(dateRange = 'today'): Promise<FinancialSummary> {
    const res = await apiClient.get(`/store/history/summary?dateRange=${dateRange}`);
    return res.data?.data;
  },

  /**
   * Fetches aggregated daily/weekly income graph points
   */
  async fetchIncomeChart(period = 'Last 7 Days'): Promise<DailyIncomePoint[]> {
    const res = await apiClient.get(`/store/history/income-chart?period=${encodeURIComponent(period)}`);
    return res.data?.data?.points || [];
  },

  /**
   * Fetches payment method breakdown percentages
   */
  async fetchPaymentBreakdown(dateRange = 'today'): Promise<PaymentBreakdownItem[]> {
    const res = await apiClient.get(`/store/history/payment-breakdown?dateRange=${dateRange}`);
    return res.data?.data?.breakdown || [];
  },

  /**
   * Exports transactions directly from MongoDB as CSV
   */
  async exportTransactionsCsv(filters?: TransactionFilters): Promise<void> {
    const queryParams = new URLSearchParams();
    if (filters?.dateRange) queryParams.set('dateRange', filters.dateRange);
    if (filters?.searchQuery?.trim()) queryParams.set('search', filters.searchQuery.trim());
    if (filters?.paymentStatus && filters.paymentStatus !== 'All') {
      queryParams.set('paymentStatus', filters.paymentStatus);
    }
    if (filters?.paymentMethod && filters.paymentMethod !== 'All') {
      queryParams.set('paymentMethod', filters.paymentMethod);
    }
    queryParams.set('format', 'csv');

    const res = await apiClient.get(`/store/history/export?${queryParams.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

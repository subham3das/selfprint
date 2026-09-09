import { apiClient } from '@/lib/axios';
import {
  AdminTransactionItem,
  TransactionStatsData,
  RefundFormValues
} from '../types/transaction.types';

export const adminTransactionsService = {
  /**
   * Fetch 6 aggregated transaction statistics cards
   */
  async fetchStats(): Promise<TransactionStatsData> {
    const res = await apiClient.get('/admin/transactions/stats');
    return res.data?.data;
  },

  /**
   * Fetch paginated and filtered transactions
   */
  async fetchTransactions(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    store?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    transactions: AdminTransactionItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const res = await apiClient.get('/admin/transactions', { params });
    return res.data?.data;
  },

  /**
   * Fetch single transaction by ID
   */
  async fetchTransactionById(id: string): Promise<AdminTransactionItem> {
    const res = await apiClient.get(`/admin/transactions/${id}`);
    return res.data?.data;
  },

  /**
   * Process refund on a transaction
   */
  async refundTransaction(id: string, values: RefundFormValues): Promise<AdminTransactionItem> {
    const res = await apiClient.post(`/admin/transactions/${id}/refund`, values);
    return res.data?.data;
  },

  /**
   * Fetch unique stores for dropdown filter
   */
  async fetchUniqueStores(): Promise<string[]> {
    const res = await apiClient.get('/admin/transactions/stores');
    return res.data?.data || [];
  }
};

export default adminTransactionsService;

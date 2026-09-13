import { apiClient } from '@/lib/axios';
import {
  AdminStoreItem,
  StoreStatsData,
  StoreFormValues,
  StoreBankDetails,
  SettlementSummaryData,
  SettlementRecord,
  CreateSettlementInput
} from '../types/store.types';

export interface FetchStoresParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  city?: string;
  plan?: string;
}

export interface FetchStoresResponse {
  stores: AdminStoreItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  uniqueCities: string[];
}

export const adminStoresService = {
  /**
   * Fetch aggregate KPI statistics across all stores
   */
  async fetchStoreStats(): Promise<StoreStatsData> {
    const res = await apiClient.get('/admin/stores/stats');
    return res.data?.data;
  },

  /**
   * Fetch paginated and filtered list of stores
   */
  async fetchStores(params?: FetchStoresParams): Promise<FetchStoresResponse> {
    const res = await apiClient.get('/admin/stores', { params });
    return res.data?.data;
  },

  /**
   * Fetch single detailed store profile & relations
   */
  async fetchStoreById(id: string) {
    const res = await apiClient.get(`/admin/stores/${id}`);
    return res.data?.data;
  },

  /**
   * Create new store with automatic settings & QR initialization
   */
  async createStore(data: StoreFormValues) {
    const payload = {
      name: data.name,
      ownerName: data.ownerName,
      ownerPhone: data.ownerPhone,
      ownerEmail: data.ownerEmail,
      city: data.city,
      state: data.state,
      fullAddress: data.fullAddress,
      pincode: data.pincode,
      plan: data.plan,
      commissionRate: data.commissionRate,
      status: data.status === 'Online' || data.status === 'Active' ? 'ACTIVE' : data.status === 'Suspended' ? 'SUSPENDED' : 'INACTIVE',
      printerCount: data.printerCount
    };
    const res = await apiClient.post('/admin/stores', payload);
    return res.data?.data;
  },

  /**
   * Update existing store details
   */
  async updateStore(id: string, data: StoreFormValues) {
    const payload = {
      name: data.name,
      ownerName: data.ownerName,
      ownerPhone: data.ownerPhone,
      ownerEmail: data.ownerEmail,
      city: data.city,
      state: data.state,
      fullAddress: data.fullAddress,
      pincode: data.pincode,
      plan: data.plan,
      commissionRate: data.commissionRate,
      status: data.status,
      printerCount: data.printerCount
    };
    const res = await apiClient.patch(`/admin/stores/${id}`, payload);
    return res.data?.data;
  },

  /**
   * Toggle store operational status
   */
  async updateStoreStatus(id: string, status: AdminStoreItem['status']) {
    const res = await apiClient.patch(`/admin/stores/${id}/status`, { status });
    return res.data?.data;
  },

  /**
   * Block store from platform
   */
  async blockStore(id: string, reason: string) {
    const res = await apiClient.post(`/admin/stores/${id}/block`, { reason });
    return res.data?.data;
  },

  /**
   * Unblock store to restore platform access
   */
  async unblockStore(id: string) {
    const res = await apiClient.post(`/admin/stores/${id}/unblock`);
    return res.data?.data;
  },

  /**
   * Permanently delete store with complete database cleanup
   */
  async deleteStore(id: string) {
    const res = await apiClient.delete(`/admin/stores/${id}`);
    return res.data?.data;
  },


  /**
   * Fetch bank details for a store (masked by default, reveal=true logs audit)
   */
  async fetchStoreBankDetails(id: string, reveal: boolean = false): Promise<StoreBankDetails> {
    const res = await apiClient.get(`/admin/stores/${id}/bank-details`, {
      params: reveal ? { reveal: 'true' } : {}
    });
    return res.data?.data;
  },

  /**
   * Log sensitive access (Copy, Download statement, etc.)
   */
  async logBankDetailsAccess(id: string, action: string) {
    const res = await apiClient.post(`/admin/stores/${id}/bank-details/log-access`, { action });
    return res.data?.data;
  },

  /**
   * Fetch settlement summary for a store
   */
  async fetchSettlementSummary(id: string): Promise<SettlementSummaryData> {
    const res = await apiClient.get(`/admin/stores/${id}/settlement-summary`);
    return res.data?.data;
  },

  /**
   * Fetch settlement history records for a store
   */
  async fetchStoreSettlements(id: string): Promise<SettlementRecord[]> {
    const res = await apiClient.get(`/admin/stores/${id}/settlements`);
    return res.data?.data;
  },

  /**
   * Record new payout settlement
   */
  async createSettlement(id: string, data: CreateSettlementInput): Promise<SettlementRecord> {
    const res = await apiClient.post(`/admin/stores/${id}/settlements`, data);
    return res.data?.data;
  }

};

export default adminStoresService;

import { apiClient } from '@/lib/axios';
import {
  AdminPrinterItem,
  PrinterStatsData,
  AdminPrinterFilterOptions,
  AdminPrintersListResponse,
  PrinterFormValues,
  TestPrintOptions
} from '../types/printer.types';

export const adminPrintersService = {
  /**
   * Fetch 6 hardware KPI cards
   */
  async fetchStats(): Promise<PrinterStatsData> {
    const res = await apiClient.get('/admin/printers/stats');
    return res.data?.data;
  },

  /**
   * Fetch dynamic store, city, and brand filters
   */
  async fetchFilters(): Promise<AdminPrinterFilterOptions> {
    const res = await apiClient.get('/admin/printers/filters');
    return res.data?.data;
  },

  /**
   * Fetch paginated, filtered & searchable printers
   */
  async fetchPrinters(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    store?: string;
    city?: string;
    brand?: string;
    type?: string;
    connectionType?: string;
  }): Promise<AdminPrintersListResponse> {
    const res = await apiClient.get('/admin/printers', { params });
    return res.data?.data;
  },

  /**
   * Fetch single printer details
   */
  async fetchPrinterById(id: string): Promise<AdminPrinterItem> {
    const res = await apiClient.get(`/admin/printers/${id}`);
    return res.data?.data;
  },

  /**
   * Register a new printer
   */
  async registerPrinter(data: Partial<PrinterFormValues> & { storeId: string }): Promise<AdminPrinterItem> {
    const res = await apiClient.post('/admin/printers', data);
    return res.data?.data;
  },

  /**
   * Update printer
   */
  async updatePrinter(id: string, data: Partial<AdminPrinterItem>): Promise<AdminPrinterItem> {
    const res = await apiClient.put(`/admin/printers/${id}`, data);
    return res.data?.data;
  },

  /**
   * Delete printer
   */
  async deletePrinter(id: string): Promise<void> {
    await apiClient.delete(`/admin/printers/${id}`);
  },

  /**
   * Hardware restart
   */
  async restartPrinter(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post(`/admin/printers/${id}/restart`);
    return res.data?.data;
  },

  /**
   * Send test print job
   */
  async testPrint(id: string, options: TestPrintOptions): Promise<any> {
    const res = await apiClient.post(`/admin/printers/${id}/test-print`, options);
    return res.data?.data;
  },

  /**
   * Toggle Pause
   */
  async togglePause(id: string): Promise<AdminPrinterItem> {
    const res = await apiClient.post(`/admin/printers/${id}/toggle-pause`);
    return res.data?.data;
  }
};

export default adminPrintersService;

import { apiClient } from '@/lib/axios';
import {
  AdminSupportTicketItem,
  SupportStatsData,
  SupportDashboardOverviewResponse,
  SupportFilterOptions,
  SupportTicketsListResponse
} from '../types/support.types';

export const adminSupportService = {
  /**
   * Fetch complete support dashboard overview
   */
  async fetchDashboard(): Promise<SupportDashboardOverviewResponse> {
    const res = await apiClient.get('/admin/support/dashboard');
    return res.data?.data;
  },

  /**
   * Fetch 6 KPI cards
   */
  async fetchStats(): Promise<SupportStatsData> {
    const res = await apiClient.get('/admin/support/stats');
    return res.data?.data;
  },

  /**
   * Fetch dynamic filters
   */
  async fetchFilters(): Promise<SupportFilterOptions> {
    const res = await apiClient.get('/admin/support/filters');
    return res.data?.data;
  },

  /**
   * Fetch paginated tickets
   */
  async fetchTickets(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    priority?: string;
    source?: string;
    store?: string;
  }): Promise<SupportTicketsListResponse> {
    const res = await apiClient.get('/admin/support/tickets', { params });
    return res.data?.data;
  },

  /**
   * Fetch single ticket details
   */
  async fetchTicketById(id: string): Promise<AdminSupportTicketItem> {
    const res = await apiClient.get(`/admin/support/tickets/${id}`);
    return res.data?.data;
  },

  /**
   * Update ticket status or priority
   */
  async updateTicket(id: string, data: Partial<AdminSupportTicketItem>): Promise<AdminSupportTicketItem> {
    const res = await apiClient.put(`/admin/support/tickets/${id}`, data);
    return res.data?.data;
  },

  /**
   * Assign staff
   */
  async assignTicket(id: string, data: { assignedAdminName: string; assignedAdminAvatar?: string }): Promise<AdminSupportTicketItem> {
    const res = await apiClient.post(`/admin/support/tickets/${id}/assign`, data);
    return res.data?.data;
  },

  /**
   * Reply message
   */
  async replyTicket(id: string, data: { message: string; senderName?: string; attachments?: string[] }): Promise<AdminSupportTicketItem> {
    const res = await apiClient.post(`/admin/support/tickets/${id}/reply`, data);
    return res.data?.data;
  },

  /**
   * Resolve ticket
   */
  async resolveTicket(id: string, data: { resolution?: string; resolvedBy?: string }): Promise<AdminSupportTicketItem> {
    const res = await apiClient.post(`/admin/support/tickets/${id}/resolve`, data);
    return res.data?.data;
  },

  /**
   * Soft delete ticket
   */
  async deleteTicket(id: string): Promise<void> {
    await apiClient.delete(`/admin/support/tickets/${id}`);
  }
};

export default adminSupportService;

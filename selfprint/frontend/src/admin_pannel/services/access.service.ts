import { apiClient } from '@/lib/axios';
import {
  StaffMember,
  AccessStatsData,
  InviteStaffFormValues,
  EditStaffFormValues,
  AccessAuditLog
} from '../types/access.types';

export interface AccessListResponse {
  staffList: StaffMember[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AccessFiltersOptionsResponse {
  roles: string[];
  departments: string[];
  statuses: string[];
}

export const adminAccessService = {
  /**
   * Fetch 6 KPI cards
   */
  async fetchStats(): Promise<AccessStatsData> {
    const res = await apiClient.get('/admin/access/stats');
    return res.data?.data;
  },

  /**
   * Fetch dynamic filter options
   */
  async fetchFilters(): Promise<AccessFiltersOptionsResponse> {
    const res = await apiClient.get('/admin/access/filters');
    return res.data?.data;
  },

  /**
   * Fetch paginated and filtered staff list
   */
  async fetchStaff(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    department?: string;
  }): Promise<AccessListResponse> {
    const res = await apiClient.get('/admin/access', { params });
    return res.data?.data;
  },

  /**
   * Fetch single staff member details
   */
  async fetchStaffById(id: string): Promise<StaffMember> {
    const res = await apiClient.get(`/admin/access/${id}`);
    return res.data?.data;
  },

  /**
   * Invite / register staff member
   */
  async inviteStaff(data: InviteStaffFormValues): Promise<StaffMember> {
    const res = await apiClient.post('/admin/access/invite', data);
    return res.data?.data;
  },

  /**
   * Update staff profile and permissions
   */
  async updateStaff(data: EditStaffFormValues): Promise<StaffMember> {
    const res = await apiClient.put(`/admin/access/${data.id}`, data);
    return res.data?.data;
  },

  /**
   * Toggle account status (Active <-> Suspended)
   */
  async toggleStatus(id: string): Promise<StaffMember> {
    const res = await apiClient.patch(`/admin/access/${id}/status`);
    return res.data?.data;
  },

  /**
   * Trigger password reset link
   */
  async resetPassword(id: string): Promise<void> {
    await apiClient.post(`/admin/access/${id}/reset-password`);
  },

  /**
   * Resend invitation email to pending staff member
   */
  async resendInvitation(id: string): Promise<StaffMember> {
    const res = await apiClient.post(`/admin/access/${id}/resend-invite`);
    return res.data?.data;
  },

  /**
   * Cancel / Revoke pending invitation
   */
  async cancelInvitation(id: string): Promise<void> {
    await apiClient.delete(`/admin/access/${id}/cancel-invite`);
  },

  /**
   * Soft delete staff member
   */
  async deleteStaff(id: string): Promise<void> {
    await apiClient.delete(`/admin/access/${id}`);
  },

  /**
   * Fetch RBAC audit logs
   */
  async fetchAuditLogs(): Promise<AccessAuditLog[]> {
    const res = await apiClient.get('/admin/access/audit-logs');
    return res.data?.data;
  }
};


export default adminAccessService;

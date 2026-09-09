import { apiClient } from '@/lib/axios';
import {
  AdminUserItem,
  UserStatsData,
  UserFormValues,
  UserStatus
} from '../types/user.types';

export interface ApiResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedUsersResponse {
  users: AdminUserItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  uniqueStores: string[];
  uniqueCities: string[];
}

export interface UserQueryParams {
  searchQuery?: string;
  status?: string;
  store?: string;
  city?: string;
  plan?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}

export const usersService = {
  /**
   * Fetch paginated and filtered users from backend
   */
  getUsers: async (params: UserQueryParams): Promise<PaginatedUsersResponse> => {
    const response = await apiClient.get<ApiResponseEnvelope<PaginatedUsersResponse>>(
      '/admin/users',
      { params }
    );
    return response.data.data;
  },

  /**
   * Fetch KPI statistics calculated from MongoDB
   */
  getUserStats: async (): Promise<UserStatsData> => {
    const response = await apiClient.get<ApiResponseEnvelope<UserStatsData>>(
      '/admin/users/stats'
    );
    return response.data.data;
  },

  /**
   * Fetch user details by ID with recent orders
   */
  getUserDetails: async (id: string): Promise<AdminUserItem> => {
    const response = await apiClient.get<ApiResponseEnvelope<AdminUserItem>>(
      `/admin/users/${id}`
    );
    return response.data.data;
  },

  /**
   * Update user profile
   */
  updateUser: async (id: string, values: UserFormValues): Promise<AdminUserItem> => {
    const response = await apiClient.put<ApiResponseEnvelope<AdminUserItem>>(
      `/admin/users/${id}`,
      values
    );
    return response.data.data;
  },

  /**
   * Toggle / update user status
   */
  updateUserStatus: async (
    id: string,
    status: UserStatus,
    reason?: string
  ): Promise<AdminUserItem> => {
    const response = await apiClient.patch<ApiResponseEnvelope<AdminUserItem>>(
      `/admin/users/${id}/status`,
      { status, reason }
    );
    return response.data.data;
  },

  /**
   * Soft delete user
   */
  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<ApiResponseEnvelope<{ success: boolean; message: string }>>(
      `/admin/users/${id}`
    );
    return response.data.data;
  },

  /**
   * Export filtered users as CSV
   */
  exportUsersCsv: async (params: UserQueryParams): Promise<void> => {
    const response = await apiClient.get('/admin/users/export', {
      params,
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `selfprint_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export default usersService;

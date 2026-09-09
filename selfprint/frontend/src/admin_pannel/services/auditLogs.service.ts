import { apiClient } from '@/lib/axios';
import {
  AuditLogEvent,
  AuditStatsData,
  HeatmapHourPoint,
  UserActivityRankItem
} from '../types/audit.types';

export interface AuditListResponse {
  logs: AuditLogEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuditTimelineGroup {
  title: string;
  date: string;
  dateGroup: 'Today' | 'Yesterday' | 'This Week' | 'Earlier';
  events: AuditLogEvent[];
}

export interface SecuritySummaryResponse {
  criticalAlerts: number;
  failedLogins: number;
  permissionChanges: number;
  suspiciousActivity: number;
  topAdmins: UserActivityRankItem[];
  mostActiveModules: { module: string; count: number; percentage: number }[];
}

export interface AuditFiltersOptionsResponse {
  modules: string[];
  actions: string[];
  severities: string[];
  statuses: string[];
  roles: string[];
}

export const adminAuditLogsService = {
  /**
   * Fetch 6 KPI cards
   */
  async fetchStats(): Promise<AuditStatsData> {
    const res = await apiClient.get('/admin/audit-logs/stats');
    return res.data?.data;
  },

  /**
   * Fetch dynamic filter options
   */
  async fetchFilters(): Promise<AuditFiltersOptionsResponse> {
    const res = await apiClient.get('/admin/audit-logs/filters');
    return res.data?.data;
  },

  /**
   * Fetch paginated and filtered audit logs
   */
  async fetchLogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    module?: string;
    action?: string;
    severity?: string;
    status?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditListResponse> {
    const res = await apiClient.get('/admin/audit-logs', { params });
    return res.data?.data;
  },

  /**
   * Fetch single audit event details
   */
  async fetchLogById(id: string): Promise<AuditLogEvent> {
    const res = await apiClient.get(`/admin/audit-logs/${id}`);
    return res.data?.data;
  },

  /**
   * Fetch security summary and active modules
   */
  async fetchSecuritySummary(): Promise<SecuritySummaryResponse> {
    const res = await apiClient.get('/admin/audit-logs/security-summary');
    return res.data?.data;
  },

  /**
   * Fetch timeline grouped events
   */
  async fetchTimeline(): Promise<AuditTimelineGroup[]> {
    const res = await apiClient.get('/admin/audit-logs/timeline');
    return res.data?.data;
  },

  /**
   * Fetch 7x24 activity heatmap
   */
  async fetchHeatmap(): Promise<HeatmapHourPoint[]> {
    const res = await apiClient.get('/admin/audit-logs/heatmap');
    return res.data?.data;
  },

  /**
   * Fetch live latest 20 events
   */
  async fetchLiveFeed(): Promise<AuditLogEvent[]> {
    const res = await apiClient.get('/admin/audit-logs/live');
    return res.data?.data;
  },

  /**
   * Export audit logs to CSV
   */
  async exportCsv(params: any): Promise<void> {
    const res = await apiClient.get('/admin/audit-logs/export', {
      params,
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

export default adminAuditLogsService;

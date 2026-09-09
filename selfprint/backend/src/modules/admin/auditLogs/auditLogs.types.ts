import { AuditSeverity, AuditStatus, AuditRiskLevel, IAuditLocation, IAuditClientInfo } from '../../../models/auditLog.model';

export interface AuditStatsResponse {
  totalLogsToday: number;
  totalLogsTrend: string;
  failedLoginAttempts: number;
  failedLoginTrend: string;
  permissionChanges: number;
  permissionChangesTrend: string;
  criticalEvents: number;
  criticalEventsTrend: string;
  activeSessions: number;
  activeSessionsTrend: string;
  securityAlerts: number;
  securityAlertsTrend: string;
}

export interface AuditLogDTO {
  id: string;
  timestamp: string;
  relativeTime: string;
  dateGroup: 'Today' | 'Yesterday' | 'This Week' | 'Earlier';
  actorName: string;
  actorEmail: string;
  actorAvatarBg: string;
  actorAvatarText: string;
  actorRole: string;
  action: string;
  module: string;
  targetResource: string;
  ipAddress: string;
  location: IAuditLocation;
  clientInfo: IAuditClientInfo;
  severity: AuditSeverity;
  status: AuditStatus;
  sessionId: string;
  executionTimeMs: number;
  riskLevel: AuditRiskLevel;
  details: string;
  oldValue?: any;
  newValue?: any;
  requestPayload?: any;
  responseSummary?: string;
}

export interface AuditListResponse {
  logs: AuditLogDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GetAuditLogsQuery {
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
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface AuditTimelineGroup {
  title: string;
  date: string;
  dateGroup: 'Today' | 'Yesterday' | 'This Week' | 'Earlier';
  events: AuditLogDTO[];
}

export interface HeatmapHourPoint {
  hour: number;
  dayIndex: number; // 0 = Mon, 6 = Sun
  count: number;
  riskCount: number;
}

export interface LoginLocationPoint {
  id: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  activeSessions: number;
  failedAttempts: number;
  lastActive: string;
}

export interface UserActivityRankItem {
  id: string;
  name: string;
  email: string;
  role: string;
  actionCount: number;
  avatarBg: string;
  avatarText: string;
  lastAction: string;
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

export type AuditActionType =
  | 'Login'
  | 'Logout'
  | 'Failed Login'
  | 'Password Reset'
  | 'Store Created'
  | 'Store Deleted'
  | 'Store Updated'
  | 'Printer Added'
  | 'Printer Removed'
  | 'Printer Restarted'
  | 'Revenue Updated'
  | 'Transaction Deleted'
  | 'User Created'
  | 'User Deleted'
  | 'Role Changed'
  | 'Permission Changed'
  | 'Support Ticket Closed'
  | 'Settings Updated'
  | 'API Key Generated'
  | 'Backup Created'
  | 'Restore Started'
  | 'File Deleted'
  | 'Database Cleanup'
  | 'Export Generated'
  | 'Payment Failed'
  | 'Payment Success'
  | 'Webhook Triggered';

export type AuditSeverity = 'Info' | 'Success' | 'Warning' | 'Critical' | 'Security';

export type AuditStatus = 'Completed' | 'Failed' | 'Blocked' | 'Pending';

export type AuditModuleType =
  | 'Auth'
  | 'Dashboard'
  | 'Stores'
  | 'Users'
  | 'Transactions'
  | 'Revenue'
  | 'Printers'
  | 'Support'
  | 'Analytics'
  | 'Settings'
  | 'Access Control'
  | 'Backup'
  | 'System'
  | 'Payment'
  | 'API';

export type AuditViewMode = 'table' | 'timeline' | 'analytics';

export type AutoRefreshInterval = 'off' | '30s' | '1m' | '5m';

export interface AuditLogLocation {
  city: string;
  state?: string;
  country: string;
  countryCode: string;
}

export interface AuditLogClientInfo {
  device: 'Desktop' | 'Mobile' | 'Tablet' | 'Server';
  browser: string;
  os: string;
  userAgent: string;
}

export interface AuditLogEvent {
  id: string;
  timestamp: string;
  relativeTime: string;
  dateGroup: 'Today' | 'Yesterday' | 'This Week' | 'Earlier';
  actorName: string;
  actorEmail: string;
  actorAvatarBg: string;
  actorAvatarText: string;
  actorRole: string;
  action: AuditActionType;
  module: AuditModuleType;
  targetResource: string;
  ipAddress: string;
  location: AuditLogLocation;
  clientInfo: AuditLogClientInfo;
  severity: AuditSeverity;
  status: AuditStatus;
  sessionId: string;
  executionTimeMs: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  details: string;
  oldValue?: Record<string, any> | string;
  newValue?: Record<string, any> | string;
  requestPayload?: Record<string, any> | string;
  responseSummary?: string;
}

export interface AuditStatsData {
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

export interface AuditFiltersState {
  searchQuery: string;
  dateRange: string;
  module: string;
  action: string;
  severity: string;
  status: string;
  role: string;
  autoRefresh: AutoRefreshInterval;
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

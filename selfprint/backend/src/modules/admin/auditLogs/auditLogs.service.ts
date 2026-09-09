import mongoose from 'mongoose';
import { AuditLogModel, IAuditLog, AuditSeverity, AuditStatus, AuditRiskLevel } from '../../../models/auditLog.model';
import { StaffModel } from '../../../models/staff.model';
import {
  AuditStatsResponse,
  AuditLogDTO,
  AuditListResponse,
  GetAuditLogsQuery,
  AuditTimelineGroup,
  HeatmapHourPoint,
  LoginLocationPoint,
  UserActivityRankItem,
  SecuritySummaryResponse,
  AuditFiltersOptionsResponse
} from './auditLogs.types';

export class AdminAuditLogsService {
  /**
   * 1. KPI Cards Aggregations (Today vs Yesterday)
   */
  public async getStats(): Promise<AuditStatsResponse> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const [
      totalToday,
      totalYesterday,
      failedLoginToday,
      failedLoginYesterday,
      permChangeToday,
      permChangeYesterday,
      criticalToday,
      criticalYesterday,
      activeStaffCount,
      securityAlertsCount
    ] = await Promise.all([
      // Total logs today vs yesterday
      AuditLogModel.countDocuments({ createdAt: { $gte: startOfToday } }),
      AuditLogModel.countDocuments({
        createdAt: { $gte: startOfYesterday, $lt: startOfToday }
      }),

      // Failed logins
      AuditLogModel.countDocuments({
        createdAt: { $gte: startOfToday },
        action: { $in: ['Failed Login', 'Login Failed', 'Authentication Failed'] }
      }),
      AuditLogModel.countDocuments({
        createdAt: { $gte: startOfYesterday, $lt: startOfToday },
        action: { $in: ['Failed Login', 'Login Failed', 'Authentication Failed'] }
      }),

      // Permission changes
      AuditLogModel.countDocuments({
        createdAt: { $gte: startOfToday },
        action: { $in: ['Permission Changed', 'Role Changed', 'Permissions Updated'] }
      }),
      AuditLogModel.countDocuments({
        createdAt: { $gte: startOfYesterday, $lt: startOfToday },
        action: { $in: ['Permission Changed', 'Role Changed', 'Permissions Updated'] }
      }),

      // Critical events
      AuditLogModel.countDocuments({
        createdAt: { $gte: startOfToday },
        severity: 'Critical'
      }),
      AuditLogModel.countDocuments({
        createdAt: { $gte: startOfYesterday, $lt: startOfToday },
        severity: 'Critical'
      }),

      // Active staff sessions / accounts
      StaffModel.countDocuments({ isDeleted: { $ne: true }, status: 'Active' }),

      // Security Alerts (Severity = Security or Critical)
      AuditLogModel.countDocuments({
        severity: { $in: ['Security', 'Critical'] },
        createdAt: { $gte: startOfToday }
      })
    ]);

    return {
      totalLogsToday: totalToday,
      totalLogsTrend: calculateTrend(totalToday, totalYesterday),
      failedLoginAttempts: failedLoginToday,
      failedLoginTrend: calculateTrend(failedLoginToday, failedLoginYesterday),
      permissionChanges: permChangeToday,
      permissionChangesTrend: calculateTrend(permChangeToday, permChangeYesterday),
      criticalEvents: criticalToday,
      criticalEventsTrend: calculateTrend(criticalToday, criticalYesterday),
      activeSessions: activeStaffCount,
      activeSessionsTrend: activeStaffCount > 0 ? `${activeStaffCount} active` : 'No active sessions',
      securityAlerts: securityAlertsCount,
      securityAlertsTrend: securityAlertsCount === 0 ? '0 unresolved' : `${securityAlertsCount} alerts today`
    };
  }

  /**
   * 2. Paginated, Searchable & Multi-Filtered Logs Table
   */
  public async getLogs(query: GetAuditLogsQuery): Promise<AuditListResponse> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(200, Number(query.limit) || 15));
    const skip = (page - 1) * limit;

    const filter = this.buildFilter(query);

    const sortField = query.sort || 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;

    const [total, logs] = await Promise.all([
      AuditLogModel.countDocuments(filter),
      AuditLogModel.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    const mapped = logs.map((l: any) => this.mapLogToDTO(l));

    return {
      logs: mapped,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    };
  }

  /**
   * 3. Single Audit Log Event Detail
   */
  public async getLogById(id: string): Promise<AuditLogDTO> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Audit Log ID');
    }

    const log = await AuditLogModel.findById(id).lean();
    if (!log) {
      throw new Error('Audit log event not found');
    }

    return this.mapLogToDTO(log);
  }

  /**
   * 4. Security Summary & Top Admins Widget
   */
  public async getSecuritySummary(): Promise<SecuritySummaryResponse> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      criticalAlerts,
      failedLogins,
      permissionChanges,
      suspiciousActivity,
      topAdminsAgg,
      modulesAgg
    ] = await Promise.all([
      AuditLogModel.countDocuments({ severity: { $in: ['Critical', 'Security'] } }),
      AuditLogModel.countDocuments({ action: { $in: ['Failed Login', 'Login Failed', 'Authentication Failed'] } }),
      AuditLogModel.countDocuments({ action: { $in: ['Permission Changed', 'Role Changed'] } }),
      AuditLogModel.countDocuments({ riskLevel: { $in: ['High', 'Critical'] } }),

      // Top Admins by Audit Actions
      AuditLogModel.aggregate([
        {
          $group: {
            _id: '$actorEmail',
            name: { $first: '$actorName' },
            role: { $first: '$actorRole' },
            actionCount: { $sum: 1 },
            lastActionDate: { $max: '$createdAt' }
          }
        },
        { $sort: { actionCount: -1 } },
        { $limit: 5 }
      ]),

      // Most Active Modules
      AuditLogModel.aggregate([
        {
          $group: {
            _id: '$module',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ])
    ]);

    const totalModuleHits = modulesAgg.reduce((acc, m) => acc + m.count, 0) || 1;

    const topAdmins: UserActivityRankItem[] = topAdminsAgg.map((a: any) => {
      const email = a._id || 'admin@selfprint.com';
      const name = a.name || email.split('@')[0];
      const avatarText = name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      return {
        id: email,
        name,
        email,
        role: a.role || 'Super Admin',
        actionCount: a.actionCount,
        avatarBg: 'bg-indigo-600',
        avatarText: avatarText || 'AD',
        lastAction: a.lastActionDate ? formatRelativeTime(a.lastActionDate) : 'Recently'
      };
    });

    const mostActiveModules = modulesAgg.map((m: any) => ({
      module: m._id || 'System',
      count: m.count,
      percentage: Math.round((m.count / totalModuleHits) * 100)
    }));

    return {
      criticalAlerts,
      failedLogins,
      permissionChanges,
      suspiciousActivity,
      topAdmins,
      mostActiveModules
    };
  }

  /**
   * 5. Chronological Timeline Groups
   */
  public async getTimeline(): Promise<AuditTimelineGroup[]> {
    const logs = await AuditLogModel.find()
      .sort({ createdAt: -1 })
      .limit(60)
      .lean();

    const dtos = logs.map((l: any) => this.mapLogToDTO(l));

    const groupsMap = new Map<string, AuditTimelineGroup>();

    dtos.forEach((item) => {
      const groupKey = item.dateGroup;
      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          title: groupKey,
          date: item.timestamp.split(',')[0] || item.dateGroup,
          dateGroup: item.dateGroup,
          events: []
        });
      }
      groupsMap.get(groupKey)!.events.push(item);
    });

    return Array.from(groupsMap.values());
  }

  /**
   * 6. 7x24 Activity & Risk Heatmap
   */
  public async getHeatmap(): Promise<HeatmapHourPoint[]> {
    const rawHeatmap = await AuditLogModel.aggregate([
      {
        $project: {
          hour: { $hour: '$createdAt' },
          dayOfWeek: { $dayOfWeek: '$createdAt' }, // 1 = Sun, 2 = Mon ... 7 = Sat
          isRisk: {
            $cond: [{ $in: ['$riskLevel', ['High', 'Critical']] }, 1, 0]
          }
        }
      },
      {
        $group: {
          _id: { hour: '$hour', dayOfWeek: '$dayOfWeek' },
          count: { $sum: 1 },
          riskCount: { $sum: '$isRisk' }
        }
      }
    ]);

    const heatmapMap = new Map<string, { count: number; riskCount: number }>();
    rawHeatmap.forEach((item: any) => {
      // Convert MongoDB 1 (Sun)..7 (Sat) to 0 (Mon)..6 (Sun)
      const mongoDay = item._id.dayOfWeek;
      const dayIndex = mongoDay === 1 ? 6 : mongoDay - 2;
      const key = `${dayIndex}-${item._id.hour}`;
      heatmapMap.set(key, {
        count: item.count,
        riskCount: item.riskCount
      });
    });

    const points: HeatmapHourPoint[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        const val = heatmapMap.get(key) || { count: 0, riskCount: 0 };
        points.push({
          dayIndex: day,
          hour,
          count: val.count,
          riskCount: val.riskCount
        });
      }
    }

    return points;
  }

  /**
   * 7. Live Activity Feed (Latest 20 Events)
   */
  public async getLiveFeed(): Promise<AuditLogDTO[]> {
    const logs = await AuditLogModel.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return logs.map((l: any) => this.mapLogToDTO(l));
  }

  /**
   * 8. Filter Dropdowns
   */
  public async getFilters(): Promise<AuditFiltersOptionsResponse> {
    const [modules, actions, severities, statuses, roles] = await Promise.all([
      AuditLogModel.distinct('module'),
      AuditLogModel.distinct('action'),
      AuditLogModel.distinct('severity'),
      AuditLogModel.distinct('status'),
      AuditLogModel.distinct('actorRole')
    ]);

    const defaultModules = [
      'All Modules',
      'Auth',
      'Dashboard',
      'Stores',
      'Users',
      'Transactions',
      'Revenue',
      'Printers',
      'Support',
      'Analytics',
      'Settings',
      'Access Control',
      'System',
      'Payment',
      'API'
    ];

    const defaultSeverities = ['All Severities', 'Info', 'Success', 'Warning', 'Critical', 'Security'];
    const defaultStatuses = ['All Status', 'Completed', 'Failed', 'Blocked', 'Pending'];
    const defaultRoles = ['All Roles', 'Super Admin', 'Admin', 'Manager', 'Finance', 'Operations', 'Support'];

    const uniqueModules = Array.from(new Set([...defaultModules, ...modules.filter(Boolean)])).sort();
    const uniqueSeverities = Array.from(new Set([...defaultSeverities, ...severities.filter(Boolean)]));
    const uniqueStatuses = Array.from(new Set([...defaultStatuses, ...statuses.filter(Boolean)]));
    const uniqueRoles = Array.from(new Set([...defaultRoles, ...roles.filter(Boolean)]));
    const uniqueActions = ['All Actions', ...actions.filter(Boolean).sort()];

    return {
      modules: uniqueModules,
      actions: uniqueActions,
      severities: uniqueSeverities,
      statuses: uniqueStatuses,
      roles: uniqueRoles
    };
  }

  /**
   * 9. Export Audit Logs (CSV)
   */
  public async exportLogs(query: GetAuditLogsQuery): Promise<string> {
    const filter = this.buildFilter(query);
    const logs = await AuditLogModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(2000)
      .lean();

    const header = [
      'ID',
      'Timestamp',
      'Actor Name',
      'Actor Email',
      'Actor Role',
      'Action',
      'Module',
      'Target Resource',
      'Severity',
      'Status',
      'Risk Level',
      'IP Address',
      'City',
      'Country',
      'Description'
    ].join(',');

    const rows = logs.map((l: any) => {
      const ts = l.createdAt ? new Date(l.createdAt).toISOString() : '';
      const city = l.location?.city || '';
      const country = l.location?.country || '';
      const cleanDesc = `"${(l.description || '').replace(/"/g, '""')}"`;
      return [
        String(l._id),
        ts,
        `"${l.actorName || ''}"`,
        l.actorEmail || '',
        l.actorRole || '',
        l.action || '',
        l.module || '',
        `"${l.targetResource || ''}"`,
        l.severity || '',
        l.status || '',
        l.riskLevel || '',
        l.ipAddress || '',
        city,
        country,
        cleanDesc
      ].join(',');
    });

    return [header, ...rows].join('\n');
  }

  /**
   * Filter builder
   */
  private buildFilter(query: GetAuditLogsQuery): any {
    const filter: any = {};

    if (query.module && query.module !== 'All Modules' && query.module !== 'All') {
      filter.module = query.module;
    }

    if (query.severity && query.severity !== 'All Severities' && query.severity !== 'All') {
      filter.severity = query.severity;
    }

    if (query.status && query.status !== 'All Status' && query.status !== 'All') {
      filter.status = query.status;
    }

    if (query.action && query.action !== 'All Actions' && query.action !== 'All') {
      filter.action = query.action;
    }

    if (query.role && query.role !== 'All Roles' && query.role !== 'All') {
      filter.actorRole = query.role;
    }

    if (query.search && query.search.trim()) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { actorName: regex },
        { actorEmail: regex },
        { action: regex },
        { module: regex },
        { targetResource: regex },
        { ipAddress: regex },
        { description: regex }
      ];
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    return filter;
  }

  private mapLogToDTO(l: any): AuditLogDTO {
    const createdDate = l.createdAt ? new Date(l.createdAt) : new Date();

    return {
      id: String(l._id),
      timestamp: createdDate.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      relativeTime: formatRelativeTime(createdDate),
      dateGroup: getDateGroup(createdDate),
      actorName: l.actorName || 'Super Admin',
      actorEmail: l.actorEmail || 'admin@selfprint.com',
      actorAvatarBg: l.actorAvatarBg || 'bg-indigo-600',
      actorAvatarText:
        l.actorAvatarText ||
        (l.actorName || 'AD')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      actorRole: l.actorRole || 'Super Admin',
      action: l.action || 'System Event',
      module: l.module || 'System',
      targetResource: l.targetResource || l.targetEntity || 'System Configuration',
      ipAddress: l.ipAddress || '127.0.0.1',
      location: l.location || {
        city: 'Guwahati',
        state: 'Assam',
        country: 'India',
        countryCode: 'IN'
      },
      clientInfo: l.clientInfo || {
        device: 'Desktop',
        browser: 'Chrome',
        os: 'Windows',
        userAgent: l.userAgent || 'Mozilla/5.0'
      },
      severity: (l.severity as AuditSeverity) || 'Info',
      status: (l.status as AuditStatus) || 'Completed',
      sessionId: l.sessionId || `sess-${String(l._id).slice(-6)}`,
      executionTimeMs: l.executionTimeMs || 45,
      riskLevel: (l.riskLevel as AuditRiskLevel) || 'Low',
      details: l.description || '',
      oldValue: l.oldValue,
      newValue: l.newValue,
      requestPayload: l.requestPayload || l.details,
      responseSummary: l.responseSummary
    };
  }
}

function calculateTrend(curr: number, prev: number): string {
  if (prev === 0 && curr === 0) return '—';
  if (prev === 0) return '+100% vs yesterday';
  const diff = ((curr - prev) / prev) * 100;
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${Math.round(diff)}% vs yesterday`;
}

function getDateGroup(d: Date): 'Today' | 'Yesterday' | 'This Week' | 'Earlier' {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (d >= startOfToday) return 'Today';
  if (d >= startOfYesterday) return 'Yesterday';
  if (d >= startOfWeek) return 'This Week';
  return 'Earlier';
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export const adminAuditLogsService = new AdminAuditLogsService();
export default adminAuditLogsService;

import { useState, useMemo, useEffect } from 'react';
import {
  AuditLogEvent,
  AuditStatsData,
  AuditFiltersState,
  AuditViewMode
} from '../types/audit.types';

import {
  INITIAL_AUDIT_LOGS,
  INITIAL_AUDIT_STATS,
  INITIAL_HEATMAP_POINTS,
  INITIAL_LOGIN_LOCATIONS,
  TOP_ACTIVE_ADMINS
} from '../data/audit.mock';

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLogEvent[]>(INITIAL_AUDIT_LOGS);
  const [stats] = useState<AuditStatsData>(INITIAL_AUDIT_STATS);
  const [viewMode, setViewMode] = useState<AuditViewMode>('table');
  const [selectedEvent, setSelectedEvent] = useState<AuditLogEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<AuditFiltersState>({
    searchQuery: '',
    dateRange: 'Today',
    module: 'All Modules',
    action: 'All Actions',
    severity: 'All Severities',
    status: 'All Statuses',
    role: 'All Roles',
    autoRefresh: 'off'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto-refresh interval simulation
  useEffect(() => {
    if (filters.autoRefresh === 'off') return;

    const ms =
      filters.autoRefresh === '30s'
        ? 30000
        : filters.autoRefresh === '1m'
        ? 60000
        : 300000;

    const interval = setInterval(() => {
      // Simulate live incoming event
      const liveEvent: AuditLogEvent = {
        id: `evt-live-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        relativeTime: 'Just now',
        dateGroup: 'Today',
        actorName: 'Subham Das',
        actorEmail: 'das01subhamj@gmail.com',
        actorAvatarBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600',
        actorAvatarText: 'SD',
        actorRole: 'Super Admin',
        action: 'Login',
        module: 'Auth',
        targetResource: 'Admin Dashboard Session',
        ipAddress: '103.142.152.12',
        location: {
          city: 'Dibrugarh',
          state: 'Assam',
          country: 'India',
          countryCode: 'IN'
        },
        clientInfo: {
          device: 'Desktop',
          browser: 'Chrome 125.0',
          os: 'macOS',
          userAgent: 'Mozilla/5.0'
        },
        severity: 'Info',
        status: 'Completed',
        sessionId: `sess_${Date.now().toString().slice(-6)}`,
        executionTimeMs: 65,
        riskLevel: 'Low',
        details: 'Heartbeat auth token renewed.'
      };

      setLogs((prev) => [liveEvent, ...prev]);
      showToast('Live event stream received 1 new event');
    }, ms);

    return () => clearInterval(interval);
  }, [filters.autoRefresh]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchActor = log.actorName.toLowerCase().includes(q);
        const matchEmail = log.actorEmail.toLowerCase().includes(q);
        const matchAction = log.action.toLowerCase().includes(q);
        const matchModule = log.module.toLowerCase().includes(q);
        const matchIP = log.ipAddress.includes(q);
        const matchSession = log.sessionId.toLowerCase().includes(q);
        const matchTarget = log.targetResource.toLowerCase().includes(q);
        if (
          !matchActor &&
          !matchEmail &&
          !matchAction &&
          !matchModule &&
          !matchIP &&
          !matchSession &&
          !matchTarget
        ) {
          return false;
        }
      }

      // Module Filter
      if (filters.module !== 'All Modules' && log.module !== filters.module) {
        return false;
      }

      // Action Filter
      if (filters.action !== 'All Actions' && log.action !== filters.action) {
        return false;
      }

      // Severity Filter
      if (filters.severity !== 'All Severities' && log.severity !== filters.severity) {
        return false;
      }

      // Status Filter
      if (filters.status !== 'All Statuses' && log.status !== filters.status) {
        return false;
      }

      // Role Filter
      if (filters.role !== 'All Roles' && log.actorRole !== filters.role) {
        return false;
      }

      return true;
    });
  }, [logs, filters]);

  // Paginated Logs
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;

  // Timeline Groups
  const timelineGroups = useMemo(() => {
    const groups: { title: string; events: AuditLogEvent[] }[] = [
      { title: 'Today', events: [] },
      { title: 'Yesterday', events: [] },
      { title: 'This Week', events: [] },
      { title: 'Earlier', events: [] }
    ];

    filteredLogs.forEach((evt) => {
      const g = groups.find((grp) => grp.title === evt.dateGroup) || groups[3];
      g.events.push(evt);
    });

    return groups.filter((g) => g.events.length > 0);
  }, [filteredLogs]);

  // Actions
  const handleOpenDrawer = (event: AuditLogEvent) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      dateRange: 'Today',
      module: 'All Modules',
      action: 'All Actions',
      severity: 'All Severities',
      status: 'All Statuses',
      role: 'All Roles',
      autoRefresh: 'off'
    });
    setCurrentPage(1);
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf' | 'json') => {
    showToast(`Exporting ${filteredLogs.length} audit logs as .${format.toUpperCase()}...`);
  };

  const handleRefresh = () => {
    showToast('Refreshed audit log feed from master ledger.');
  };

  return {
    logs,
    filteredLogs,
    paginatedLogs,
    timelineGroups,
    stats,
    heatmapPoints: INITIAL_HEATMAP_POINTS,
    loginLocations: INITIAL_LOGIN_LOCATIONS,
    topAdmins: TOP_ACTIVE_ADMINS,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    selectedEvent,
    isDrawerOpen,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    toastMessage,
    handleOpenDrawer,
    handleCloseDrawer,
    handleResetFilters,
    handleExport,
    handleRefresh
  };
};

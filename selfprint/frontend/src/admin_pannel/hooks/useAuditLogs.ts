import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AuditLogEvent,
  AuditViewMode,
  AuditFiltersState,
  AuditStatsData,
  LoginLocationPoint,
  UserActivityRankItem,
  AutoRefreshInterval
} from '../types/audit.types';
import { adminAuditLogsService } from '../services/auditLogs.service';
import { getSocket } from '@/lib/socket';

const defaultStats: AuditStatsData = {
  totalLogsToday: 0,
  totalLogsTrend: '—',
  failedLoginAttempts: 0,
  failedLoginTrend: '—',
  permissionChanges: 0,
  permissionChangesTrend: '—',
  criticalEvents: 0,
  criticalEventsTrend: '—',
  activeSessions: 0,
  activeSessionsTrend: '—',
  securityAlerts: 0,
  securityAlertsTrend: '—'
};

const getPollingInterval = (interval: AutoRefreshInterval): number | false => {
  switch (interval) {
    case '30s':
      return 30000;
    case '1m':
      return 60000;
    case '5m':
      return 300000;
    case 'off':
    default:
      return false;
  }
};

export const useAuditLogs = () => {
  const queryClient = useQueryClient();

  // View Mode: 'table' | 'timeline' | 'analytics'
  const [viewMode, setViewMode] = useState<AuditViewMode>('table');

  // Filters State
  const [filters, setFilters] = useState<AuditFiltersState>({
    searchQuery: '',
    dateRange: 'All Time',
    module: 'All Modules',
    action: 'All Actions',
    severity: 'All Severities',
    status: 'All Status',
    role: 'All Roles',
    autoRefresh: 'off'
  });

  // Drawer State for Inspecting Single Event
  const [selectedEvent, setSelectedEvent] = useState<AuditLogEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refetchInterval = getPollingInterval(filters.autoRefresh);

  // 1. Fetch Stats
  const {
    data: stats = defaultStats,
    isLoading: isStatsLoading,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['admin-audit-stats'],
    queryFn: () => adminAuditLogsService.fetchStats(),
    refetchInterval,
    staleTime: 10000
  });

  // 2. Fetch Dynamic Filter Dropdown Options
  const { data: filterOptions } = useQuery({
    queryKey: ['admin-audit-filters'],
    queryFn: () => adminAuditLogsService.fetchFilters(),
    staleTime: 60000
  });

  // 3. Fetch Paginated & Filtered Logs Table
  const {
    data: logsResponse,
    isLoading: isLogsLoading,
    isError,
    error,
    refetch: refetchLogs
  } = useQuery({
    queryKey: [
      'admin-audit-logs-table',
      currentPage,
      pageSize,
      filters.searchQuery,
      filters.module,
      filters.action,
      filters.severity,
      filters.status,
      filters.role
    ],
    queryFn: () =>
      adminAuditLogsService.fetchLogs({
        page: currentPage,
        limit: pageSize,
        search: filters.searchQuery || undefined,
        module: filters.module !== 'All Modules' ? filters.module : undefined,
        action: filters.action !== 'All Actions' ? filters.action : undefined,
        severity: filters.severity !== 'All Severities' ? filters.severity : undefined,
        status: filters.status !== 'All Status' ? filters.status : undefined,
        role: filters.role !== 'All Roles' ? filters.role : undefined
      }),
    refetchInterval,
    staleTime: 5000
  });

  // 4. Fetch Security Summary & Top Admins
  const {
    data: securitySummary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ['admin-audit-security-summary'],
    queryFn: () => adminAuditLogsService.fetchSecuritySummary(),
    refetchInterval,
    staleTime: 15000
  });

  // 5. Fetch Timeline Groups
  const {
    data: timelineGroups = [],
    isLoading: isTimelineLoading,
    refetch: refetchTimeline
  } = useQuery({
    queryKey: ['admin-audit-timeline'],
    queryFn: () => adminAuditLogsService.fetchTimeline(),
    enabled: viewMode === 'timeline',
    refetchInterval,
    staleTime: 15000
  });

  // 6. Fetch 7x24 Heatmap
  const {
    data: heatmapPoints = [],
    isLoading: isHeatmapLoading,
    refetch: refetchHeatmap
  } = useQuery({
    queryKey: ['admin-audit-heatmap'],
    queryFn: () => adminAuditLogsService.fetchHeatmap(),
    enabled: viewMode === 'analytics',
    refetchInterval,
    staleTime: 30000
  });

  // 7. Fetch Live Latest 20 Feed
  const {
    data: liveFeed = [],
    refetch: refetchLiveFeed
  } = useQuery({
    queryKey: ['admin-audit-live-feed'],
    queryFn: () => adminAuditLogsService.fetchLiveFeed(),
    refetchInterval: 10000,
    staleTime: 5000
  });

  // 8. Socket.io Real-Time Synchronization
  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket) return;

      const handleLiveLog = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-audit-logs-table'] });
        queryClient.invalidateQueries({ queryKey: ['admin-audit-stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin-audit-live-feed'] });
        queryClient.invalidateQueries({ queryKey: ['admin-audit-timeline'] });
        queryClient.invalidateQueries({ queryKey: ['admin-audit-heatmap'] });
        queryClient.invalidateQueries({ queryKey: ['admin-audit-security-summary'] });
      };

      socket.on('AUDIT_LOG_CREATED', handleLiveLog);

      return () => {
        socket.off('AUDIT_LOG_CREATED', handleLiveLog);
      };
    } catch {
      // Socket offline
    }
  }, [queryClient]);

  const paginatedLogs = logsResponse?.logs || [];
  const totalFilteredCount = logsResponse?.pagination?.total || 0;
  const totalPages = logsResponse?.pagination?.pages || 1;
  const isLoading = isStatsLoading || isLogsLoading || isSummaryLoading;

  const topAdmins: UserActivityRankItem[] = securitySummary?.topAdmins || [];
  const loginLocations: LoginLocationPoint[] = [
    {
      id: 'loc-1',
      city: 'Guwahati',
      state: 'Assam',
      country: 'India',
      countryCode: 'IN',
      lat: 26.1445,
      lng: 91.7362,
      activeSessions: stats.activeSessions || 1,
      failedAttempts: stats.failedLoginAttempts || 0,
      lastActive: 'Active Now'
    }
  ];

  // Drawer handlers
  const handleOpenDrawer = (event: AuditLogEvent) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEvent(null);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      dateRange: 'All Time',
      module: 'All Modules',
      action: 'All Actions',
      severity: 'All Severities',
      status: 'All Status',
      role: 'All Roles',
      autoRefresh: filters.autoRefresh
    });
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refetchStats();
    refetchLogs();
    refetchSummary();
    refetchLiveFeed();
    if (viewMode === 'timeline') refetchTimeline();
    if (viewMode === 'analytics') refetchHeatmap();
    showToast('Audit records synchronized.');
  };

  const handleExport = async (_format: 'csv' | 'excel' | 'pdf' | 'json' = 'csv') => {
    try {
      showToast('Generating audit report download...');
      await adminAuditLogsService.exportCsv({
        search: filters.searchQuery || undefined,
        module: filters.module !== 'All Modules' ? filters.module : undefined,
        action: filters.action !== 'All Actions' ? filters.action : undefined,
        severity: filters.severity !== 'All Severities' ? filters.severity : undefined,
        status: filters.status !== 'All Status' ? filters.status : undefined,
        role: filters.role !== 'All Roles' ? filters.role : undefined
      });
      showToast('Audit log export completed successfully.');
    } catch {
      showToast('Failed to export audit report.');
    }
  };

  return {
    logs: liveFeed.length > 0 ? liveFeed : paginatedLogs,
    filteredLogs: paginatedLogs,
    paginatedLogs,
    totalFilteredCount,
    timelineGroups,
    stats,
    heatmapPoints,
    loginLocations,
    topAdmins,
    filterOptions,
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
    isLoading,
    isTimelineLoading,
    isHeatmapLoading,
    isError,
    error,
    toastMessage,
    handleOpenDrawer,
    handleCloseDrawer,
    handleResetFilters,
    handleExport,
    handleRefresh
  };
};

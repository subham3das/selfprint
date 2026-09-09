import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AdminSupportTicketItem,
  SupportFilterState,
  TicketStatus,
  SupportDashboardOverviewResponse
} from '../types/support.types';
import { adminSupportService } from '../services/support.service';
import { getSocket } from '@/lib/socket';

const defaultDashboard: SupportDashboardOverviewResponse = {
  stats: {
    totalTickets: 0,
    openTickets: 0,
    inProgress: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    satisfactionRate: '--',
    cards: [
      { id: 'total-tickets', title: 'Total Tickets', value: '0', trend: '—', isPositive: true, sparkline: [0, 0, 0, 0], color: '#6366F1' },
      { id: 'open-tickets', title: 'Open Tickets', value: '0', trend: 'None open', isPositive: true, sparkline: [0, 0, 0, 0], color: '#3B82F6' },
      { id: 'in-progress', title: 'In Progress', value: '0', trend: 'Idle', isPositive: true, sparkline: [0, 0, 0, 0], color: '#F59E0B' },
      { id: 'resolved-tickets', title: 'Resolved Tickets', value: '0', trend: '—', isPositive: true, sparkline: [0, 0, 0, 0], color: '#10B981' },
      { id: 'closed-tickets', title: 'Closed Tickets', value: '0', trend: '—', isPositive: true, sparkline: [0, 0, 0, 0], color: '#64748B' },
      { id: 'satisfaction', title: 'Customer Satisfaction', value: '--', trend: 'No ratings yet', isPositive: false, sparkline: [0, 0, 0, 0], color: '#EC4899' }
    ]
  },
  supportOverviewSegments: [],
  recentActivities: [],
  issueCategories: []
};

export const useSupport = () => {
  const queryClient = useQueryClient();

  // Filters State
  const [filters, setFilters] = useState<SupportFilterState>({
    searchQuery: '',
    status: 'All',
    category: 'All',
    priority: 'All',
    source: 'All'
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  // Modals State
  const [viewingTicket, setViewingTicket] = useState<AdminSupportTicketItem | null>(null);
  const [replyingTicket, setReplyingTicket] = useState<AdminSupportTicketItem | null>(null);
  const [assigningTicket, setAssigningTicket] = useState<AdminSupportTicketItem | null>(null);

  // 1. Fetch Dashboard Overview (Stats, Chart, Feed, Categories)
  const {
    data: dashboardData = defaultDashboard,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    refetch: refetchDashboard
  } = useQuery({
    queryKey: ['admin-support-dashboard'],
    queryFn: () => adminSupportService.fetchDashboard(),
    staleTime: 15000
  });

  // 2. Fetch Filtered & Paginated Tickets List
  const {
    data: ticketsResponse,
    isLoading: isTicketsLoading,
    isError: isTicketsError,
    error: ticketsError,
    refetch: refetchTickets
  } = useQuery({
    queryKey: [
      'admin-support-tickets',
      currentPage,
      pageSize,
      filters.searchQuery,
      filters.status,
      filters.category,
      filters.priority,
      filters.source
    ],
    queryFn: () =>
      adminSupportService.fetchTickets({
        page: currentPage,
        limit: pageSize,
        search: filters.searchQuery || undefined,
        status: filters.status !== 'All' ? filters.status : undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        priority: filters.priority !== 'All' ? filters.priority : undefined,
        source: filters.source !== 'All' ? filters.source : undefined
      }),
    staleTime: 10000
  });

  // 3. Real-Time Socket.io Synchronization
  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket) return;

      const handleLiveUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
        queryClient.invalidateQueries({ queryKey: ['admin-support-dashboard'] });
      };

      socket.on('TICKET_CREATED', handleLiveUpdate);
      socket.on('TICKET_UPDATED', handleLiveUpdate);
      socket.on('TICKET_REPLY_ADDED', handleLiveUpdate);

      return () => {
        socket.off('TICKET_CREATED', handleLiveUpdate);
        socket.off('TICKET_UPDATED', handleLiveUpdate);
        socket.off('TICKET_REPLY_ADDED', handleLiveUpdate);
      };
    } catch {
      // Socket not ready
    }
  }, [queryClient]);

  // 4. Mutations
  const replyMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      adminSupportService.replyTicket(id, { message }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-dashboard'] });
      setReplyingTicket(null);
      if (viewingTicket?.id === updated.id) {
        setViewingTicket(updated);
      }
    }
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, adminName }: { id: string; adminName: string }) =>
      adminSupportService.assignTicket(id, { assignedAdminName: adminName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-dashboard'] });
      setAssigningTicket(null);
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      adminSupportService.updateTicket(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-dashboard'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminSupportService.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-dashboard'] });
    }
  });

  const paginatedTickets = ticketsResponse?.tickets || [];
  const totalFilteredCount = ticketsResponse?.pagination?.total || 0;
  const totalPages = ticketsResponse?.pagination?.pages || 1;
  const isLoading = isDashboardLoading || isTicketsLoading;
  const isError = isDashboardError || isTicketsError;

  const handleSendReply = (ticketId: string, messageText: string) => {
    replyMutation.mutate({ id: ticketId, message: messageText });
  };

  const handleAssignTicket = (ticketId: string, adminName: string) => {
    assignMutation.mutate({ id: ticketId, adminName });
  };

  const handleChangeStatus = (ticketId: string, newStatus: TicketStatus) => {
    statusMutation.mutate({ id: ticketId, status: newStatus });
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (confirm('Are you sure you want to remove this ticket record?')) {
      deleteMutation.mutate(ticketId);
    }
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      status: 'All',
      category: 'All',
      priority: 'All',
      source: 'All'
    });
    setCurrentPage(1);
  };

  const refetchAll = () => {
    refetchDashboard();
    refetchTickets();
  };

  return {
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalFilteredCount,
    totalPages,
    paginatedTickets,
    stats: dashboardData.stats || defaultDashboard.stats,
    recentActivities: dashboardData.recentActivities || [],
    issueCategories: dashboardData.issueCategories || [],
    supportOverviewSegments: dashboardData.supportOverviewSegments || [],
    isLoading,
    isError,
    error: ticketsError,
    refetch: refetchAll,
    viewingTicket,
    setViewingTicket,
    replyingTicket,
    setReplyingTicket,
    assigningTicket,
    setAssigningTicket,
    handleSendReply,
    handleAssignTicket,
    handleChangeStatus,
    handleDeleteTicket,
    resetFilters
  };
};

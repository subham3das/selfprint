import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AdminSupportTicketItem,
  SupportFilterState,
  TicketStatus,
  TicketPriority
} from '../types/support.types';
import {
  SUPPORT_STATS_MOCK,
  RECENT_SUPPORT_ACTIVITIES,
  ISSUE_CATEGORIES_STATS,
  SUPPORT_OVERVIEW_SEGMENTS,
  getAllMockSupportTickets
} from '../data/support.mock';

export const useSupport = () => {
  // Filter States
  const [filters, setFilters] = useState<SupportFilterState>({
    searchQuery: '',
    status: 'All',
    category: 'All',
    priority: 'All',
    source: 'All'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [viewingTicket, setViewingTicket] = useState<AdminSupportTicketItem | null>(null);
  const [replyingTicket, setReplyingTicket] = useState<AdminSupportTicketItem | null>(null);
  const [assigningTicket, setAssigningTicket] = useState<AdminSupportTicketItem | null>(null);

  // TanStack Query Mock Loader
  const initialTickets = useMemo(() => getAllMockSupportTickets(), []);
  const [ticketList, setTicketList] = useState<AdminSupportTicketItem[]>(initialTickets);

  const { data: stats = SUPPORT_STATS_MOCK, isLoading } = useQuery({
    queryKey: ['admin-support-stats'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 40));
      return SUPPORT_STATS_MOCK;
    },
    staleTime: 60000
  });

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return ticketList.filter((t) => {
      // Search
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesId = t.ticketId.toLowerCase().includes(query);
        const matchesSubject = t.subject.toLowerCase().includes(query);
        const matchesCustomer = t.customerName.toLowerCase().includes(query);
        const matchesEmail = t.customerEmail.toLowerCase().includes(query);

        if (!matchesId && !matchesSubject && !matchesCustomer && !matchesEmail) {
          return false;
        }
      }

      // Status
      if (filters.status !== 'All' && t.status !== filters.status) {
        return false;
      }

      // Category
      if (filters.category !== 'All' && t.category !== filters.category) {
        return false;
      }

      // Priority
      if (filters.priority !== 'All' && t.priority !== filters.priority) {
        return false;
      }

      // Source
      if (filters.source !== 'All' && t.source !== filters.source) {
        return false;
      }

      return true;
    });
  }, [ticketList, filters]);

  // Pagination calculation
  const totalFilteredCount = filteredTickets.length;
  const totalPages = Math.ceil(totalFilteredCount / pageSize) || 1;

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTickets.slice(startIndex, startIndex + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  // Mutations
  const handleSendReply = (ticketId: string, replyText: string) => {
    setTicketList((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId && t.ticketId !== ticketId) return t;
        const newMsg = {
          id: `reply-${Date.now()}`,
          sender: 'admin' as const,
          senderName: 'Super Admin',
          message: replyText,
          timestamp: 'Just now'
        };
        return {
          ...t,
          status: 'In Progress' as TicketStatus,
          messages: [...t.messages, newMsg]
        };
      })
    );
    setReplyingTicket(null);
    if (viewingTicket) {
      setViewingTicket((prev) =>
        prev
          ? {
              ...prev,
              status: 'In Progress',
              messages: [
                ...prev.messages,
                {
                  id: `reply-${Date.now()}`,
                  sender: 'admin' as const,
                  senderName: 'Super Admin',
                  message: replyText,
                  timestamp: 'Just now'
                }
              ]
            }
          : null
      );
    }
  };

  const handleAssignTicket = (
    ticketId: string,
    adminName: string,
    priority?: TicketPriority
  ) => {
    setTicketList((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId && t.ticketId !== ticketId) return t;
        return {
          ...t,
          assignedAdminName: adminName,
          ...(priority ? { priority } : {})
        };
      })
    );
    setAssigningTicket(null);
  };

  const handleChangeStatus = (ticketId: string, newStatus: TicketStatus) => {
    setTicketList((prev) =>
      prev.map((t) => (t.id === ticketId || t.ticketId === ticketId ? { ...t, status: newStatus } : t))
    );
    if (viewingTicket && (viewingTicket.id === ticketId || viewingTicket.ticketId === ticketId)) {
      setViewingTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (confirm('Are you sure you want to permanently delete this support ticket?')) {
      setTicketList((prev) => prev.filter((t) => t.id !== ticketId && t.ticketId !== ticketId));
      if (viewingTicket && (viewingTicket.id === ticketId || viewingTicket.ticketId === ticketId)) {
        setViewingTicket(null);
      }
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
    stats,
    isLoading,
    recentActivities: RECENT_SUPPORT_ACTIVITIES,
    issueCategories: ISSUE_CATEGORIES_STATS,
    supportOverviewSegments: SUPPORT_OVERVIEW_SEGMENTS,
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

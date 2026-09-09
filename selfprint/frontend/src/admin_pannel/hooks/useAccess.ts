import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  StaffMember,
  AccessFiltersState,
  InviteStaffFormValues,
  EditStaffFormValues,
  AccessStatsData
} from '../types/access.types';
import { adminAccessService } from '../services/access.service';
import { getSocket } from '@/lib/socket';

const defaultStats: AccessStatsData = {
  totalStaff: 0,
  activeStaff: 0,
  admins: 0,
  managers: 0,
  supportStaff: 0,
  pendingInvites: 0
};

export const useAccess = () => {
  const queryClient = useQueryClient();

  // Filters State
  const [filters, setFilters] = useState<AccessFiltersState>({
    searchQuery: '',
    role: 'All Roles',
    status: 'All Status',
    department: 'All Departments'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({});

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };


  // 1. Fetch Stats
  const {
    data: stats = defaultStats,
    isLoading: isStatsLoading
  } = useQuery({
    queryKey: ['admin-access-stats'],
    queryFn: () => adminAccessService.fetchStats(),
    staleTime: 15000
  });

  // 2. Fetch Dynamic Filters
  const { data: filterOptions } = useQuery({
    queryKey: ['admin-access-filters'],
    queryFn: () => adminAccessService.fetchFilters(),
    staleTime: 60000
  });

  // 3. Fetch Paginated & Filtered Staff
  const {
    data: staffResponse,
    isLoading: isStaffLoading,
    isError,
    error,
    refetch: refetchStaff
  } = useQuery({
    queryKey: [
      'admin-access-staff-list',
      currentPage,
      pageSize,
      filters.searchQuery,
      filters.role,
      filters.status,
      filters.department
    ],
    queryFn: () =>
      adminAccessService.fetchStaff({
        page: currentPage,
        limit: pageSize,
        search: filters.searchQuery || undefined,
        role: filters.role !== 'All Roles' ? filters.role : undefined,
        status: filters.status !== 'All Status' ? filters.status : undefined,
        department: filters.department !== 'All Departments' ? filters.department : undefined
      }),
    staleTime: 10000
  });

  // 4. Fetch Audit Logs
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['admin-access-audit-logs'],
    queryFn: () => adminAccessService.fetchAuditLogs(),
    staleTime: 30000
  });

  // 5. Socket.io Real-Time Synchronization
  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket) return;

      const handleLiveUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-access-staff-list'] });
        queryClient.invalidateQueries({ queryKey: ['admin-access-stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin-access-audit-logs'] });
      };

      socket.on('STAFF_INVITED', handleLiveUpdate);
      socket.on('STAFF_UPDATED', handleLiveUpdate);
      socket.on('STAFF_DELETED', handleLiveUpdate);

      return () => {
        socket.off('STAFF_INVITED', handleLiveUpdate);
        socket.off('STAFF_UPDATED', handleLiveUpdate);
        socket.off('STAFF_DELETED', handleLiveUpdate);
      };
    } catch {
      // Socket not ready
    }
  }, [queryClient]);

  // 6. Mutations
  const inviteMutation = useMutation({
    mutationFn: (values: InviteStaffFormValues) => {
      setInviteErrors({});
      return adminAccessService.inviteStaff(values);
    },
    onSuccess: (newStaff) => {
      queryClient.invalidateQueries({ queryKey: ['admin-access-staff-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-access-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-access-audit-logs'] });
      setInviteErrors({});
      setIsInviteModalOpen(false);
      showToast(`Invitation sent to ${newStaff.email} successfully!`);
    },
    onError: (err: any) => {
      if (err?.response?.data?.errors) {
        setInviteErrors(err.response.data.errors);
      } else {
        showToast(err?.response?.data?.message || 'Failed to invite staff member');
      }
    }
  });


  const editMutation = useMutation({
    mutationFn: (values: EditStaffFormValues) => adminAccessService.updateStaff(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-access-staff-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-access-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-access-audit-logs'] });
      setIsEditModalOpen(false);
      showToast('Staff member updated successfully!');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to update staff member');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => adminAccessService.toggleStatus(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-access-staff-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-access-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-access-audit-logs'] });
      showToast(`Status updated to ${updated.status}.`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminAccessService.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-access-staff-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-access-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-access-audit-logs'] });
      showToast('Staff member removed.');
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) => adminAccessService.resetPassword(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-access-audit-logs'] });
      showToast('Password reset link sent.');
    }
  });

  const paginatedStaff = staffResponse?.staffList || [];
  const totalFilteredCount = staffResponse?.pagination?.total || 0;
  const totalPages = staffResponse?.pagination?.pages || 1;
  const isLoading = isStatsLoading || isStaffLoading;

  const handleInviteStaff = (values: InviteStaffFormValues) => {
    inviteMutation.mutate(values);
  };

  const handleEditStaff = (values: EditStaffFormValues) => {
    editMutation.mutate(values);
  };

  const handleToggleStatus = (staff: StaffMember) => {
    toggleStatusMutation.mutate(staff.id);
  };

  const handleDeleteStaff = (staff: StaffMember) => {
    if (confirm(`Are you sure you want to delete staff account ${staff.fullName} (${staff.email})?`)) {
      deleteMutation.mutate(staff.id);
    }
  };

  const handleDuplicatePermissions = (staff: StaffMember) => {
    setSelectedStaff({
      ...staff,
      id: '',
      fullName: `${staff.fullName} (Copy)`,
      email: ''
    });
    setIsInviteModalOpen(true);
    showToast(`Loaded permission template from ${staff.fullName}.`);
  };

  const handleResetPassword = (staff: StaffMember) => {
    resetPasswordMutation.mutate(staff.id);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      role: 'All Roles',
      status: 'All Status',
      department: 'All Departments'
    });
    setCurrentPage(1);
  };

  const resendInviteMutation = useMutation({
    mutationFn: (id: string) => adminAccessService.resendInvitation(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-access-staff-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-access-audit-logs'] });
      showToast(`Fresh invitation email sent to ${updated.email}!`);
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to resend invitation');
    }
  });

  const cancelInviteMutation = useMutation({
    mutationFn: (id: string) => adminAccessService.cancelInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-access-staff-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-access-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-access-audit-logs'] });
      showToast('Invitation cancelled successfully.');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to cancel invitation');
    }
  });

  const handleResendInvite = (staff: StaffMember) => {
    resendInviteMutation.mutate(staff.id);
  };

  const handleCancelInvite = (staff: StaffMember) => {
    if (confirm(`Cancel pending invitation for ${staff.fullName} (${staff.email})?`)) {
      cancelInviteMutation.mutate(staff.id);
    }
  };

  const handleCopyInviteLink = (staff: StaffMember) => {
    const token = staff.inviteToken;
    if (!token) {
      showToast('Invitation token not available for this user.');
      return;
    }
    const url = `${window.location.origin}/admin/activate?token=${token}`;
    navigator.clipboard.writeText(url);
    showToast('Invitation link copied to clipboard!');
  };

  return {
    filteredStaff: paginatedStaff,
    paginatedStaff,
    totalFilteredCount,
    stats,
    auditLogs,
    filterOptions,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    isLoading,
    isError,
    error,
    refetch: refetchStaff,
    isInviteModalOpen,
    setIsInviteModalOpen,
    inviteErrors,
    setInviteErrors,
    isInviteSubmitting: inviteMutation.isPending,

    isEditModalOpen,
    setIsEditModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    isAuditModalOpen,
    setIsAuditModalOpen,
    selectedStaff,
    setSelectedStaff,
    toastMessage,
    handleInviteStaff,
    handleResendInvite,
    handleCopyInviteLink,
    handleCancelInvite,
    handleEditStaff,
    handleToggleStatus,
    handleDeleteStaff,
    handleDuplicatePermissions,
    handleResetPassword,
    handleResetFilters
  };
};



import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AdminUserItem,
  UserFilterState,
  UserFormValues,
  UserStatsData,
  UserStatus
} from '../types/user.types';
import { usersService } from '../services/users.service';

const emptyStats: UserStatsData = {
  totalUsers: 0,
  totalUsersTrend: '0% from last month',
  activeUsers: 0,
  activeUsersTrend: '0% from last month',
  newUsersToday: 0,
  newUsersTrend: '0% from yesterday',
  verifiedUsers: 0,
  verifiedPercent: '0% of total users',
  bannedUsers: 0,
  bannedUsersTrend: '0% from last month',
  usersOnline: 0,
  onlineSubtitle: 'Live right now'
};

export const useUsers = () => {
  const queryClient = useQueryClient();

  // Filters State
  const [filters, setFilters] = useState<UserFilterState>({
    searchQuery: '',
    status: 'All',
    store: 'All',
    city: 'All',
    plan: 'All'
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<AdminUserItem | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);

  // 1. Fetch Paginated Users Query
  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['admin-users-list', filters, currentPage, pageSize],
    queryFn: () =>
      usersService.getUsers({
        searchQuery: filters.searchQuery || undefined,
        status: filters.status !== 'All' ? filters.status : undefined,
        store: filters.store !== 'All' ? filters.store : undefined,
        city: filters.city !== 'All' ? filters.city : undefined,
        plan: filters.plan !== 'All' ? filters.plan : undefined,
        page: currentPage,
        pageSize
      }),
    staleTime: 5000
  });

  // 2. Fetch User Stats Query
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['admin-users-stats'],
    queryFn: () => usersService.getUserStats(),
    staleTime: 10000
  });

  // 3. User Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: UserFormValues }) =>
      usersService.updateUser(id, values),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-stats'] });
      setEditingUser(null);
      if (selectedUserProfile?.id === updatedUser.id) {
        setSelectedUserProfile(updatedUser);
      }
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      usersService.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-stats'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-stats'] });
    }
  });

  // Open User Details with fresh server data
  const handleOpenUserProfile = async (user: AdminUserItem) => {
    setSelectedUserProfile(user);
    setSelectedUserId(user.id);
    try {
      const freshUser = await usersService.getUserDetails(user.id);
      setSelectedUserProfile(freshUser);
    } catch {
      // Keep existing user preview if network fails
    }
  };

  // Reset Filters
  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      status: 'All',
      store: 'All',
      city: 'All',
      plan: 'All'
    });
    setCurrentPage(1);
  };

  // Export Users to CSV
  const handleExportUsers = async () => {
    try {
      await usersService.exportUsersCsv({
        searchQuery: filters.searchQuery || undefined,
        status: filters.status !== 'All' ? filters.status : undefined,
        store: filters.store !== 'All' ? filters.store : undefined,
        city: filters.city !== 'All' ? filters.city : undefined,
        plan: filters.plan !== 'All' ? filters.plan : undefined
      });
    } catch (err) {
      console.error('Failed to export users CSV:', err);
    }
  };

  // Mutation Handlers
  const handleUpdateUser = (id: string, values: UserFormValues) => {
    updateMutation.mutate({ id, values });
  };

  const handleToggleUserStatus = (id: string, newStatus: UserStatus) => {
    statusMutation.mutate({ id, status: newStatus });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user from the system?')) {
      deleteMutation.mutate(id);
    }
  };

  return {
    filters,
    setFilters,
    uniqueStores: usersData?.uniqueStores ?? [],
    uniqueCities: usersData?.uniqueCities ?? [],
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalCount: usersData?.totalCount ?? 0,
    totalPages: usersData?.totalPages ?? 1,
    paginatedUsers: usersData?.users ?? [],
    resetFilters,
    handleExportUsers,
    stats: statsData ?? emptyStats,
    isLoading: isUsersLoading && !usersData,
    isError: isUsersError,
    error: usersError,
    selectedUserProfile,
    setSelectedUserProfile,
    selectedUserId,
    handleOpenUserProfile,
    editingUser,
    setEditingUser,
    handleUpdateUser,
    handleToggleUserStatus,
    handleDeleteUser,
    refetchAll: () => {
      refetchUsers();
      refetchStats();
    }
  };
};

export default useUsers;

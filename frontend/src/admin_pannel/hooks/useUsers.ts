import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AdminUserItem,
  UserFilterState,
  UserFormValues
} from '../types/user.types';
import { getAllMockUsers, USER_STATS_MOCK } from '../data/users.mock';

export const useUsers = () => {
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
  const [selectedUserProfile, setSelectedUserProfile] = useState<AdminUserItem | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);

  // TanStack Query for users data
  const { data: initialUsers = getAllMockUsers(), isLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 40));
      return getAllMockUsers();
    },
    staleTime: 60000
  });

  // Local state for instant mutations
  const [userList, setUserList] = useState<AdminUserItem[]>(initialUsers);

  // Extract unique filter dropdown values
  const uniqueStores = useMemo(() => {
    const set = new Set<string>();
    userList.forEach((u) => set.add(u.storeName));
    return Array.from(set).sort();
  }, [userList]);

  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    userList.forEach((u) => set.add(u.city));
    return Array.from(set).sort();
  }, [userList]);

  // Combined Multi-Filter Engine
  const filteredUsers = useMemo(() => {
    return userList.filter((user) => {
      // 1. Search Query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesName = user.name.toLowerCase().includes(query);
        const matchesEmail = user.email.toLowerCase().includes(query);
        const matchesPhone = user.phone.toLowerCase().includes(query);
        const matchesStore = user.storeName.toLowerCase().includes(query);
        const matchesCity = user.city.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesStore &&
          !matchesCity
        ) {
          return false;
        }
      }

      // 2. Status Filter
      if (filters.status !== 'All' && user.status !== filters.status) {
        return false;
      }

      // 3. Store Filter
      if (filters.store !== 'All' && user.storeName !== filters.store) {
        return false;
      }

      // 4. City Filter
      if (filters.city !== 'All' && user.city !== filters.city) {
        return false;
      }

      // 5. Plan Filter
      if (filters.plan !== 'All' && user.membershipPlan !== filters.plan) {
        return false;
      }

      return true;
    });
  }, [userList, filters]);

  // Pagination calculations
  const totalCount = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

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
  const handleExportUsers = () => {
    const headers = 'ID,Name,Email,Phone,Store,City,State,TotalOrders,TotalSpent,Status,JoinedOn,LastActive\n';
    const rows = filteredUsers
      .map(
        (u) =>
          `"${u.userIdCode}","${u.name}","${u.email}","${u.phone}","${u.storeName}","${u.city}","${u.state}",${u.totalOrders},"${u.totalSpentFormatted}","${u.status}","${u.joinedOn}","${u.lastActive}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `selfprint_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mutations
  const handleUpdateUser = (id: string, values: UserFormValues) => {
    setUserList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            name: values.name,
            phone: values.phone,
            email: values.email,
            fullAddress: values.address,
            city: values.city,
            status: values.status,
            membershipPlan: values.membershipPlan
          };
        }
        return u;
      })
    );
    setEditingUser(null);
  };

  const handleToggleUserStatus = (id: string, newStatus: AdminUserItem['status']) => {
    setUserList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
    );
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user from the system?')) {
      setUserList((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return {
    filters,
    setFilters,
    uniqueStores,
    uniqueCities,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    paginatedUsers,
    resetFilters,
    handleExportUsers,
    stats: USER_STATS_MOCK,
    isLoading,
    selectedUserProfile,
    setSelectedUserProfile,
    editingUser,
    setEditingUser,
    handleUpdateUser,
    handleToggleUserStatus,
    handleDeleteUser
  };
};

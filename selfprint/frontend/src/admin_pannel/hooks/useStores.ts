import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AdminStoreItem,
  StoreFilterState,
  StoreFormValues,
  StoreStatsData
} from '../types/store.types';
import { adminStoresService, FetchStoresResponse } from '../services/stores.service';

const defaultStats: StoreStatsData = {
  totalStores: 0,
  activeStores: 0,
  activePercent: '0%',
  offlineStores: 0,
  offlinePercent: '0%',
  pendingApproval: 0,
  pendingPercent: '0%',
  suspendedStores: 0,
  suspendedPercent: '0%',
  totalCities: 0
};

export const useStores = () => {
  const queryClient = useQueryClient();

  // Filters State
  const [filters, setFilters] = useState<StoreFilterState>({
    searchQuery: '',
    status: 'All',
    city: 'All',
    plan: 'All'
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal States
  const [viewingStore, setViewingStore] = useState<AdminStoreItem | null>(null);
  const [editingStore, setEditingStore] = useState<AdminStoreItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // 1. Live KPI Statistics Query
  const {
    data: stats = defaultStats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats
  } = useQuery<StoreStatsData>({
    queryKey: ['admin-stores-stats'],
    queryFn: () => adminStoresService.fetchStoreStats(),
    staleTime: 15000
  });

  // 2. Live Paginated & Filtered Stores Query
  const {
    data: storesData,
    isLoading: isStoresLoading,
    isError: isStoresError,
    error: storesError,
    refetch: refetchStores
  } = useQuery<FetchStoresResponse>({
    queryKey: [
      'admin-stores-list',
      currentPage,
      pageSize,
      filters.searchQuery,
      filters.status,
      filters.city,
      filters.plan
    ],
    queryFn: () =>
      adminStoresService.fetchStores({
        page: currentPage,
        limit: pageSize,
        search: filters.searchQuery || undefined,
        status: filters.status !== 'All' ? filters.status : undefined,
        city: filters.city !== 'All' ? filters.city : undefined,
        plan: filters.plan !== 'All' ? filters.plan : undefined
      }),
    staleTime: 10000
  });

  const stores = storesData?.stores || [];
  const totalCount = storesData?.total || 0;
  const totalPages = storesData?.totalPages || 1;
  const uniqueCities = storesData?.uniqueCities || [];

  const refetchAll = async () => {
    await Promise.all([refetchStats(), refetchStores()]);
  };

  // Reset Filters handler
  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      status: 'All',
      city: 'All',
      plan: 'All'
    });
    setCurrentPage(1);
  };

  // 3. Create Store Mutation
  const createMutation = useMutation({
    mutationFn: (values: StoreFormValues) => adminStoresService.createStore(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stores-stats'] });
      setIsCreateModalOpen(false);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to create store. Please try again.');
    }
  });

  // 4. Update Store Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: StoreFormValues }) =>
      adminStoresService.updateStore(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stores-stats'] });
      setEditingStore(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update store. Please try again.');
    }
  });

  // 5. Toggle Store Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminStoreItem['status'] }) =>
      adminStoresService.updateStoreStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stores-stats'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update store status.');
    }
  });

  // 6. Delete Store Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminStoresService.deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stores-stats'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete store.');
    }
  });

  const handleCreateStore = (values: StoreFormValues) => {
    createMutation.mutate(values);
  };

  const handleUpdateStore = (id: string, values: StoreFormValues) => {
    updateMutation.mutate({ id, values });
  };

  const handleToggleStoreStatus = (id: string, newStatus: AdminStoreItem['status']) => {
    toggleStatusMutation.mutate({ id, status: newStatus });
  };

  const handleDeleteStore = (id: string) => {
    if (confirm('Are you sure you want to deactivate this store from the platform?')) {
      deleteMutation.mutate(id);
    }
  };

  const isError = isStoresError || isStatsError;
  const error = storesError || statsError;

  return {
    filters,
    setFilters,
    uniqueCities,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    paginatedStores: stores,
    resetFilters,
    isLoading: isStoresLoading,
    isStatsLoading,
    isError,
    error,
    refetch: refetchAll,
    stats,
    viewingStore,
    setViewingStore,
    editingStore,
    setEditingStore,
    isCreateModalOpen,
    setIsCreateModalOpen,
    handleCreateStore,
    handleUpdateStore,
    handleToggleStoreStatus,
    handleDeleteStore,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      toggleStatusMutation.isPending ||
      deleteMutation.isPending
  };
};

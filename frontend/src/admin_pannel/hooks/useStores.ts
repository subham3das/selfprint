import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AdminStoreItem,
  StoreFilterState,
  StoreFormValues
} from '../types/store.types';
import { getAllMockStores, STORE_STATS_MOCK } from '../data/stores.mock';

export const useStores = () => {
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

  // Stores Data with TanStack Query
  const { data: initialStores = getAllMockStores(), isLoading } = useQuery({
    queryKey: ['admin-stores-list'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 40));
      return getAllMockStores();
    },
    staleTime: 60000
  });

  // Local state for instant mutations (Add/Edit/Delete/Status)
  const [storeList, setStoreList] = useState<AdminStoreItem[]>(initialStores);

  // Extract unique cities list for dropdown
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    storeList.forEach((s) => set.add(s.city));
    return Array.from(set).sort();
  }, [storeList]);

  // Combined Multi-Filter & Search Engine
  const filteredStores = useMemo(() => {
    return storeList.filter((store) => {
      // 1. Search Query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesName = store.name.toLowerCase().includes(query);
        const matchesOwner = store.ownerName.toLowerCase().includes(query);
        const matchesEmail = store.email.toLowerCase().includes(query);
        const matchesPhone = store.ownerPhone.toLowerCase().includes(query);
        const matchesCity = store.city.toLowerCase().includes(query);
        const matchesCode = store.storeIdCode.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesOwner &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesCity &&
          !matchesCode
        ) {
          return false;
        }
      }

      // 2. Status Filter
      if (filters.status !== 'All' && store.status !== filters.status) {
        return false;
      }

      // 3. City Filter
      if (filters.city !== 'All' && store.city !== filters.city) {
        return false;
      }

      // 4. Plan Filter
      if (filters.plan !== 'All' && store.plan !== filters.plan) {
        return false;
      }

      return true;
    });
  }, [storeList, filters]);

  // Pagination Calculation
  const totalCount = filteredStores.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Current page items slice
  const paginatedStores = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStores.slice(startIndex, startIndex + pageSize);
  }, [filteredStores, currentPage, pageSize]);

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

  // CRUD Actions
  const handleCreateStore = (values: StoreFormValues) => {
    const newId = `store-${Date.now()}`;
    const newCode = `SP-${Math.floor(10000 + Math.random() * 90000)}`;
    const initials = values.name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

    const newStore: AdminStoreItem = {
      id: newId,
      storeIdCode: newCode,
      name: values.name,
      email: values.ownerEmail,
      logoText: initials || 'SP',
      logoBgColor: 'bg-indigo-600 text-white',
      ownerName: values.ownerName,
      ownerPhone: values.ownerPhone,
      ownerEmail: values.ownerEmail,
      city: values.city,
      state: values.state,
      fullAddress: values.fullAddress,
      pincode: values.pincode,
      plan: values.plan,
      ordersCount: 0,
      revenueRaw: 0,
      revenueFormatted: '₹0',
      commissionRaw: 0,
      commissionFormatted: '₹0',
      commissionRate: values.commissionRate,
      status: values.status,
      lastActive: 'Just registered',
      printerCount: values.printerCount,
      qrGenerated: true,
      joinedDate: 'Today'
    };

    setStoreList((prev) => [newStore, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleUpdateStore = (id: string, values: StoreFormValues) => {
    setStoreList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            name: values.name,
            ownerName: values.ownerName,
            ownerPhone: values.ownerPhone,
            ownerEmail: values.ownerEmail,
            city: values.city,
            state: values.state,
            fullAddress: values.fullAddress,
            pincode: values.pincode,
            commissionRate: values.commissionRate,
            plan: values.plan,
            printerCount: values.printerCount,
            status: values.status
          };
        }
        return s;
      })
    );
    setEditingStore(null);
  };

  const handleToggleStoreStatus = (id: string, newStatus: AdminStoreItem['status']) => {
    setStoreList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  const handleDeleteStore = (id: string) => {
    if (confirm('Are you sure you want to delete this store from the platform?')) {
      setStoreList((prev) => prev.filter((s) => s.id !== id));
    }
  };

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
    paginatedStores,
    resetFilters,
    isLoading,
    stats: STORE_STATS_MOCK,
    viewingStore,
    setViewingStore,
    editingStore,
    setEditingStore,
    isCreateModalOpen,
    setIsCreateModalOpen,
    handleCreateStore,
    handleUpdateStore,
    handleToggleStoreStatus,
    handleDeleteStore
  };
};

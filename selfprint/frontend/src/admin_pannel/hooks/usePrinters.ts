import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AdminPrinterItem,
  PrinterFilterState,
  PrinterFormValues,
  TestPrintOptions,
  PrinterStatsData
} from '../types/printer.types';
import { adminPrintersService } from '../services/printers.service';
import { getSocket } from '@/lib/socket';

const defaultStats: PrinterStatsData = {
  totalPrinters: 0,
  onlinePrinters: 0,
  onlinePercent: '0% of total',
  onlineTrend: 'No online devices',
  busyPrinters: 0,
  busyPercent: '0% of total',
  busyTrend: 'Idle',
  offlinePrinters: 0,
  offlinePercent: '0% of total',
  offlineTrend: 'All connected',
  maintenancePrinters: 0,
  maintenancePercent: '0% of total',
  maintenanceTrend: 'None',
  totalPrintsMonth: 0,
  totalPrintsMonthTrend: '0% from last month'
};

export const usePrinters = () => {
  const queryClient = useQueryClient();

  // Filters State
  const [filters, setFilters] = useState<PrinterFilterState>({
    searchQuery: '',
    status: 'All',
    store: 'All',
    city: 'All',
    type: 'All',
    brand: 'All'
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  // Modals State
  const [viewingPrinter, setViewingPrinter] = useState<AdminPrinterItem | null>(null);
  const [editingPrinter, setEditingPrinter] = useState<AdminPrinterItem | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [testPrintingPrinter, setTestPrintingPrinter] = useState<AdminPrinterItem | null>(null);

  // 1. Fetch Printer Statistics
  const {
    data: stats = defaultStats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['admin-printer-stats'],
    queryFn: () => adminPrintersService.fetchStats(),
    staleTime: 15000
  });

  // 2. Fetch Dynamic Filter Options
  const { data: filterOptions } = useQuery({
    queryKey: ['admin-printer-filters'],
    queryFn: () => adminPrintersService.fetchFilters(),
    staleTime: 60000
  });

  // 3. Fetch Filtered & Paginated Printers List
  const {
    data: printersResponse,
    isLoading: isPrintersLoading,
    isError: isPrintersError,
    error: printersError,
    refetch: refetchPrinters
  } = useQuery({
    queryKey: [
      'admin-printers-list',
      currentPage,
      pageSize,
      filters.searchQuery,
      filters.status,
      filters.store,
      filters.city,
      filters.type,
      filters.brand
    ],
    queryFn: () =>
      adminPrintersService.fetchPrinters({
        page: currentPage,
        limit: pageSize,
        search: filters.searchQuery || undefined,
        status: filters.status !== 'All' ? filters.status : undefined,
        store: filters.store !== 'All' ? filters.store : undefined,
        city: filters.city !== 'All' ? filters.city : undefined,
        type: filters.type !== 'All' ? filters.type : undefined,
        brand: filters.brand !== 'All' ? filters.brand : undefined
      }),
    staleTime: 10000
  });

  // 4. Socket.io Real-Time Synchronization
  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket) return;

      const handleLiveUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-printers-list'] });
        queryClient.invalidateQueries({ queryKey: ['admin-printer-stats'] });
      };

      socket.on('PRINTER_STATUS_CHANGED', handleLiveUpdate);
      socket.on('PRINT_JOB_STATUS_CHANGED', handleLiveUpdate);

      return () => {
        socket.off('PRINTER_STATUS_CHANGED', handleLiveUpdate);
        socket.off('PRINT_JOB_STATUS_CHANGED', handleLiveUpdate);
      };
    } catch {
      // Socket not ready
    }
  }, [queryClient]);

  // 5. Mutations
  const registerMutation = useMutation({
    mutationFn: (values: PrinterFormValues) => {
      const storeId = values.storeId || (filterOptions?.stores?.find((s) => s.name === values.storeName)?.id || '');
      return adminPrintersService.registerPrinter({
        ...values,
        storeId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-printers-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-printer-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-printer-filters'] });
      setIsRegisterModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: Partial<AdminPrinterItem> }) =>
      adminPrintersService.updatePrinter(id, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-printers-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-printer-stats'] });
      setEditingPrinter(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminPrintersService.deletePrinter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-printers-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-printer-stats'] });
    }
  });

  const restartMutation = useMutation({
    mutationFn: (id: string) => adminPrintersService.restartPrinter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-printers-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-printer-stats'] });
    }
  });

  const testPrintMutation = useMutation({
    mutationFn: ({ id, options }: { id: string; options: TestPrintOptions }) =>
      adminPrintersService.testPrint(id, options),
    onSuccess: () => {
      setTestPrintingPrinter(null);
    }
  });

  const togglePauseMutation = useMutation({
    mutationFn: (id: string) => adminPrintersService.togglePause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-printers-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-printer-stats'] });
    }
  });

  const paginatedPrinters = printersResponse?.printers || [];
  const totalFilteredCount = printersResponse?.pagination?.total || 0;
  const totalPages = printersResponse?.pagination?.pages || 1;
  const isLoading = isStatsLoading || isPrintersLoading;
  const isError = isStatsError || isPrintersError;

  const uniqueStores = ['All', ...(filterOptions?.stores?.map((s) => s.name) || [])];
  const uniqueCities = ['All', ...(filterOptions?.cities || [])];
  const uniqueBrands = ['All', ...(filterOptions?.brands || [])];

  const handleRegisterPrinter = (values: PrinterFormValues) => {
    registerMutation.mutate(values);
  };

  const handleUpdatePrinter = (id: string, updatedFields: Partial<AdminPrinterItem>) => {
    updateMutation.mutate({ id, fields: updatedFields });
  };

  const handleRestartPrinter = (id: string) => {
    restartMutation.mutate(id);
  };

  const handleTestPrint = (options: TestPrintOptions) => {
    if (testPrintingPrinter) {
      testPrintMutation.mutate({ id: testPrintingPrinter.id, options });
    }
  };

  const handleTogglePrintingPause = (id: string) => {
    togglePauseMutation.mutate(id);
  };

  const handleDeletePrinter = (id: string) => {
    if (confirm('Are you sure you want to unregister and remove this printer?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      status: 'All',
      store: 'All',
      city: 'All',
      type: 'All',
      brand: 'All'
    });
    setCurrentPage(1);
  };

  const refetchAll = () => {
    refetchStats();
    refetchPrinters();
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
    paginatedPrinters,
    stats,
    isLoading,
    isError,
    error: printersError,
    refetch: refetchAll,
    uniqueStores,
    uniqueCities,
    uniqueBrands,
    viewingPrinter,
    setViewingPrinter,
    editingPrinter,
    setEditingPrinter,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    testPrintingPrinter,
    setTestPrintingPrinter,
    handleRegisterPrinter,
    handleUpdatePrinter,
    handleRestartPrinter,
    handleTestPrint,
    handleTogglePrintingPause,
    handleDeletePrinter,
    resetFilters
  };
};

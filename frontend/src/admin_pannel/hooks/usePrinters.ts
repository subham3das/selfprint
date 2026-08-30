import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AdminPrinterItem,
  PrinterFilterState,
  PrinterFormValues,
  TestPrintOptions
} from '../types/printer.types';
import {
  PRINTER_STATS_MOCK,
  getAllMockPrinters
} from '../data/printers.mock';

export const usePrinters = () => {
  // Filters
  const [filters, setFilters] = useState<PrinterFilterState>({
    searchQuery: '',
    status: 'All',
    store: 'All',
    city: 'All',
    type: 'All',
    brand: 'All'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals
  const [viewingPrinter, setViewingPrinter] = useState<AdminPrinterItem | null>(null);
  const [editingPrinter, setEditingPrinter] = useState<AdminPrinterItem | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [testPrintingPrinter, setTestPrintingPrinter] = useState<AdminPrinterItem | null>(null);

  // TanStack Query Mock DataLoader
  const initialPrinters = useMemo(() => getAllMockPrinters(), []);
  const [printerList, setPrinterList] = useState<AdminPrinterItem[]>(initialPrinters);

  const { data: stats = PRINTER_STATS_MOCK, isLoading } = useQuery({
    queryKey: ['admin-printer-stats'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 40));
      return PRINTER_STATS_MOCK;
    },
    staleTime: 60000
  });

  // Filtered dataset
  const filteredPrinters = useMemo(() => {
    return printerList.filter((p) => {
      // Search
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesId = p.printerId.toLowerCase().includes(query);
        const matchesStore = p.storeName.toLowerCase().includes(query);
        const matchesCity = p.city.toLowerCase().includes(query);
        const matchesBrand = p.brand.toLowerCase().includes(query);
        const matchesModel = p.model.toLowerCase().includes(query);
        const matchesLocation = p.locationArea.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesId &&
          !matchesStore &&
          !matchesCity &&
          !matchesBrand &&
          !matchesModel &&
          !matchesLocation
        ) {
          return false;
        }
      }

      // Status
      if (filters.status !== 'All' && p.status !== filters.status) {
        return false;
      }

      // Store
      if (filters.store !== 'All' && p.storeName !== filters.store) {
        return false;
      }

      // City
      if (filters.city !== 'All' && p.city !== filters.city) {
        return false;
      }

      // Type
      if (filters.type !== 'All' && p.type !== filters.type) {
        return false;
      }

      // Brand
      if (filters.brand !== 'All' && p.brand !== filters.brand) {
        return false;
      }

      return true;
    });
  }, [printerList, filters]);

  // Pagination calculation
  const totalFilteredCount = filteredPrinters.length;
  const totalPages = Math.ceil(totalFilteredCount / pageSize) || 1;

  const paginatedPrinters = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPrinters.slice(startIndex, startIndex + pageSize);
  }, [filteredPrinters, currentPage, pageSize]);

  // Unique stores, cities, brands for filter dropdowns
  const uniqueStores = useMemo(() => {
    const set = new Set<string>();
    printerList.forEach((p) => set.add(p.storeName));
    return ['All', ...Array.from(set)];
  }, [printerList]);

  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    printerList.forEach((p) => set.add(p.city));
    return ['All', ...Array.from(set)];
  }, [printerList]);

  const uniqueBrands = useMemo(() => {
    const set = new Set<string>();
    printerList.forEach((p) => set.add(p.brand));
    return ['All', ...Array.from(set)];
  }, [printerList]);

  // Actions / Mutations
  const handleRegisterPrinter = (values: PrinterFormValues) => {
    const newIdNum = printerList.length + 1;
    const padded = String(newIdNum).padStart(4, '0');
    const newPrinter: AdminPrinterItem = {
      id: `prt-${Date.now()}`,
      printerId: `PRT-250501-${padded}`,
      name: values.name,
      thumbnailUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=100&auto=format&fit=crop&q=80',
      serialNumber: `SN${newIdNum}999${values.brand.substring(0, 2).toUpperCase()}`,
      storeName: values.storeName,
      storeLogoBg: 'bg-indigo-600 text-white',
      storeLogoText: values.storeName.substring(0, 2).toUpperCase(),
      city: values.city,
      state: 'Assam',
      locationArea: values.locationArea || 'Front Counter',
      locationFloor: values.locationFloor || 'Ground Floor',
      brand: values.brand,
      model: values.model,
      type: values.type,
      connection: values.connection,
      ipAddress: values.ipAddress || '192.168.1.150',
      macAddress: '00:1B:44:99:AA:88',
      firmwareVersion: 'v2025.01.01',
      status: values.status,
      printsThisMonth: 0,
      printsTrend: '0%',
      printsToday: 0,
      lifetimePrints: 0,
      lastPrinted: 'Just now',
      lastPrintedTime: '10:35 AM',
      healthPercent: 100,
      paperLevelPercent: 100,
      paperTrayCapacity: '250 / 250 Sheets',
      inkLevels: { black: 100, cyan: 100, magenta: 100, yellow: 100 },
      temperature: '26°C',
      networkStrength: '98%',
      successRate: '100%',
      avgPrintTime: '3.5s / page',
      supportedPaperSizes: values.supportedPaperSizes
    };

    setPrinterList((prev) => [newPrinter, ...prev]);
    setIsRegisterModalOpen(false);
  };

  const handleUpdatePrinter = (id: string, updatedFields: Partial<AdminPrinterItem>) => {
    setPrinterList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
    setEditingPrinter(null);
  };

  const handleRestartPrinter = (id: string) => {
    setPrinterList((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: 'Online', healthPercent: Math.min(100, p.healthPercent + 10) }
          : p
      )
    );
    alert('Printer hardware reboot sequence initiated. Status reset to Online.');
  };

  const handleTestPrint = (options: TestPrintOptions) => {
    alert(`Sending test print job (${options.testType} Test, ${options.copies} copy) to ${options.printerId}...`);
    setTestPrintingPrinter(null);
  };

  const handleTogglePrintingPause = (id: string) => {
    setPrinterList((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nextStatus = p.status === 'Busy' ? 'Idle' : 'Busy';
        return { ...p, status: nextStatus };
      })
    );
  };

  const handleDeletePrinter = (id: string) => {
    if (confirm('Are you sure you want to unregister and remove this printer?')) {
      setPrinterList((prev) => prev.filter((p) => p.id !== id));
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

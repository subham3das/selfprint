import { useRuntimeStore } from '../stores/useRuntimeStore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { QueueStatsGrid } from '../components/queue/QueueStatsGrid';
import { QueueTableCard } from '../components/queue/QueueTableCard';
import { CurrentJobCard } from '../components/queue/CurrentJobCard';
import { QueueActionsCard } from '../components/queue/QueueActionsCard';
import { QueueJobDetailsModal } from '../components/queue/QueueJobDetailsModal';
import { QueueFilterModal } from '../components/queue/QueueFilterModal';
import { PrinterSettingsModal } from '../components/PrinterSettingsModal';
import { QRPosterModal } from '../components/qr/QRPosterModal';
import { PrinterStatusInfo, SummaryBreakdown } from '../types/dashboard.types';
import { useStoreSession } from '../hooks/useStoreSession';
import { useStoreDashboard } from '../hooks/useStoreDashboard';
import { useStoreQueue } from '../hooks/useStoreQueue';
import { initialQRConfig } from '../data/qrData';
import {
  QueueJobItem,
  QueueJobStatus,
  QueueFilters,
  QueueSummaryStats
} from '../types/queue.types';

const defaultSummary: SummaryBreakdown = {
  totalJobs: 0,
  completed: 0,
  completedPercent: 0,
  printing: 0,
  printingPercent: 0,
  waiting: 0,
  waitingPercent: 0,
  failed: 0,
  failedPercent: 0,
  totalRevenue: '₹0.00'
};

export const QueuePage: React.FC = () => {
  const navigate = useNavigate();
  const storeInfo = useStoreSession();

  const [activeNav, setActiveNav] = useState('queue');
  const [isPaused, setIsPaused] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const runtime = useRuntimeStore();

  // Filter State
  const [filters, setFilters] = useState<QueueFilters>({
    searchQuery: '',
    statusTab: 'All Jobs',
    paperSize: 'All',
    colorMode: 'All',
    sortBy: 'newest'
  });

  // Modals
  const [selectedJobForModal, setSelectedJobForModal] =
    useState<QueueJobItem | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // 1. Live Store Dashboard Overview
  const {
    dashboardData,
    refreshCountdown
  } = useStoreDashboard();

  // 2. Live Store Queue from MongoDB
  const {
    jobs,
    isFetching: isQueueFetching,
    refetch: refetchQueue,
    updateStatus,
    deleteJob,
    clearCompleted
  } = useStoreQueue({
    status: filters.statusTab === 'All Jobs' ? undefined : filters.statusTab,
    search: filters.searchQuery,
    paperSize: filters.paperSize,
    colorMode: filters.colorMode,
    sortBy: filters.sortBy
  });

  // Calculate live summary stats directly from MongoDB dashboard stats
  const summary: QueueSummaryStats = {
    printingNow: dashboardData?.summary?.printing ?? 0,
    waitingInQueue: dashboardData?.summary?.waiting ?? 0,
    completedToday: dashboardData?.summary?.completed ?? 0,
    failedToday: dashboardData?.summary?.failed ?? 0,
    cancelledToday: 0,
    totalRevenueToday: typeof dashboardData?.stats?.find((s: any) => s.id === 'revenue')?.value === 'number'
      ? (dashboardData.stats.find((s: any) => s.id === 'revenue')?.value as number)
      : 0,
    avgWaitTimeMinutes: 0
  };

  // Actions
  const handleNavChange = (navId: string) => {
    setActiveNav(navId);
    if (navId === 'dashboard') {
      navigate('/store');
    } else if (navId === 'queue') {
      navigate('/store/queue');
    } else if (navId === 'history') {
      navigate('/store/history');
    } else if (navId === 'qr') {
      navigate('/store/qr');
    } else if (navId === 'settings') {
      navigate('/store/settings');
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: QueueJobStatus) => {
    try {
      await updateStatus({ jobId, status: newStatus });
    } catch (err) {
      console.error('Failed to update job status:', err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteJob(jobId);
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  const handleClearCompleted = async () => {
    try {
      await clearCompleted();
    } catch (err) {
      console.error('Failed to clear completed jobs:', err);
    }
  };

  const handleManualRefresh = async () => {
    await refetchQueue();
  };

  // Find currently printing job from MongoDB
  const currentPrintingJob =
    jobs.find((j) => j.status === 'Printing') || null;

  // Real backend printer status
  const rawPrinter = dashboardData?.printer;
  const isPrinterVirtual = Boolean(
    (rawPrinter as any)?.isVirtual ||
    rawPrinter?.name?.toLowerCase().includes('virtual') ||
    rawPrinter?.name?.toLowerCase().includes('print to pdf')
  );
  const isPrinterConfigured = Boolean(
    runtime.testMode
      ? isPrinterVirtual
      : (dashboardData?.store?.printerConfigured && rawPrinter?.name && rawPrinter.name !== 'No printer configured' && !isPrinterVirtual)
  );
  const isPrinterOnline =
    isPrinterConfigured &&
    Boolean(
      rawPrinter &&
      rawPrinter.name &&
      rawPrinter.name !== 'No printer connected' &&
      rawPrinter.name !== 'No printer configured' &&
      (rawPrinter.isOnline || rawPrinter.printerStatus === 'Ready' || rawPrinter.printerStatus === 'Printing')
    );

  const printerStatusInfo: PrinterStatusInfo = isPrinterConfigured && rawPrinter
    ? {
        name: rawPrinter.name || 'Store Printer',
        model: rawPrinter.model || 'LaserJet',
        isOnline: isPrinterOnline,
        isConfigured: true,
        connectionStatus: isPrinterOnline ? 'Connected' : 'Disconnected',
        printerStatus: rawPrinter.printerStatus || 'Ready',
        paperSize: 'A4',
        tonerPercentage: rawPrinter.tonerPercentage ?? 0,
        paperPercentage: rawPrinter.paperPercentage ?? 0
      }
    : {
        name: 'No printer configured',
        model: 'Not Configured',
        isOnline: false,
        isConfigured: false,
        connectionStatus: 'Disconnected',
        printerStatus: 'Not Configured',
        paperSize: 'A4',
        tonerPercentage: 0
      };

  const handleTogglePause = () => setIsPaused((prev) => !prev);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        storeInfo={storeInfo}
        summary={dashboardData?.summary ?? defaultSummary}
        printerStatus={printerStatusInfo}
        isPrinterConfigured={isPrinterConfigured}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        onOpenQRModal={() => setIsQRModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* Top Header */}
          <Header
            title="Queue"
            subtitle="Manage and monitor all print jobs"
            storeInfo={storeInfo}
            isPrinterOnline={isPrinterOnline}
            isPrinterConfigured={isPrinterConfigured}
            isPaused={isPaused}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            onOpenQRModal={() => setIsQRModalOpen(true)}
          />

          {/* Top 4 Summary Stat Cards */}
          <QueueStatsGrid
            summary={summary}
            onSelectStatus={(status) =>
              setFilters((prev) => ({
                ...prev,
                statusTab: status as QueueJobStatus
              }))
            }
          />

          {/* Main 2-Column Grid: Queue Table (8 cols) + Current Job & Actions (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Queue Table */}
            <div className="lg:col-span-8 flex flex-col">
              <QueueTableCard
                jobs={jobs}
                filters={filters}
                onTabChange={(tab) =>
                  setFilters((prev) => ({ ...prev, statusTab: tab }))
                }
                onSearchChange={(query) =>
                  setFilters((prev) => ({ ...prev, searchQuery: query }))
                }
                onOpenFilterModal={() => setIsFilterModalOpen(true)}
                onViewDetails={(job) => setSelectedJobForModal(job)}
                onStatusChange={handleStatusChange}
                onDeleteJob={handleDeleteJob}
              />
            </div>

            {/* Right Column: Current Job Card + Queue Actions Card */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <CurrentJobCard
                currentJob={currentPrintingJob}
                onViewDetails={(job) => setSelectedJobForModal(job)}
              />

              <QueueActionsCard
                onClearCompleted={handleClearCompleted}
                onRefresh={handleManualRefresh}
                isRefreshing={isQueueFetching}
              />
            </div>
          </div>

          {/* Live Auto-refresh Ticker */}
          <div className="pt-2 pb-6 flex items-center justify-end">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isQueueFetching ? 'animate-spin text-indigo-600' : 'text-slate-400'
                }`}
              />
              <span>
                Queue auto-refreshes every 5 seconds{' '}
                <span className="text-slate-400 font-mono text-[11px]">
                  ({refreshCountdown}s)
                </span>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Modals */}
      <QueueJobDetailsModal
        job={selectedJobForModal}
        onClose={() => setSelectedJobForModal(null)}
        onStatusChange={handleStatusChange}
      />

      <QueueFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={(updated) =>
          setFilters((prev) => ({ ...prev, ...updated }))
        }
        onResetFilters={() =>
          setFilters({
            searchQuery: '',
            statusTab: 'All Jobs',
            paperSize: 'All',
            colorMode: 'All',
            sortBy: 'newest'
          })
        }
      />

      <PrinterSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        printer={printerStatusInfo}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((prev) => !prev)}
      />

      <QRPosterModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        config={initialQRConfig}
      />
    </div>
  );
};

export default QueuePage;

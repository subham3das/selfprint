import React, { useState, useEffect } from 'react';
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
import {
  mockStoreInfo,
  mockPrinterStatus,
  mockSummaryBreakdown
} from '../data/dashboardData';
import { initialQRConfig } from '../data/qrData';
import {
  initialQueueSummary,
  getSharedQueueJobs,
  updateSharedQueueJobs
} from '../data/queueData';
import {
  QueueJobItem,
  QueueJobStatus,
  QueueFilters,
  QueueSummaryStats
} from '../types/queue.types';

export const QueuePage: React.FC = () => {
  const navigate = useNavigate();

  // State initialized with shared in-memory jobs
  const [jobs, setJobs] = useState<QueueJobItem[]>(getSharedQueueJobs);
  const [summary, setSummary] = useState<QueueSummaryStats>(initialQueueSummary);
  const [activeNav, setActiveNav] = useState('queue');
  const [isPaused, setIsPaused] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filter State
  const [filters, setFilters] = useState<QueueFilters>({
    searchQuery: '',
    statusTab: 'All Jobs',
    paperSize: 'All',
    colorMode: 'All',
    sortBy: 'newest'
  });

  // Ticker & Live Updates
  const [countdown, setCountdown] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [selectedJobForModal, setSelectedJobForModal] =
    useState<QueueJobItem | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Recalculate summary stats when jobs change
  const refreshSummaryStats = (currentJobs: QueueJobItem[]) => {
    const printing = currentJobs.filter((j) => j.status === 'Printing').length;
    const waiting = currentJobs.filter((j) => j.status === 'Waiting').length;
    const completed = currentJobs.filter((j) => j.status === 'Completed').length;
    const failed = currentJobs.filter((j) => j.status === 'Failed').length;
    const cancelled = currentJobs.filter((j) => j.status === 'Cancelled').length;

    setSummary((prev) => ({
      ...prev,
      printingNow: printing,
      waitingInQueue: waiting,
      completedToday: completed + 43, // Keep base reference numbers
      failedToday: failed,
      cancelledToday: cancelled
    }));
  };

  // Auto-refresh ticker (5 seconds matching reference)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRefreshing(true);
          // Simulate printing progress increment
          setJobs((currentJobs) => {
            const updated = currentJobs.map((j) => {
              if (j.status === 'Printing' && !isPaused) {
                const nextPage = Math.min(
                  (j.currentPrintingPage || 1) + 1,
                  j.pages
                );
                const percent = Math.round((nextPage / j.pages) * 100);
                return {
                  ...j,
                  currentPrintingPage: nextPage,
                  progressPercent: percent
                };
              }
              return j;
            });
            updateSharedQueueJobs(updated);
            return updated;
          });

          setTimeout(() => setIsRefreshing(false), 500);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

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



  const handleStatusChange = (jobId: string, newStatus: QueueJobStatus) => {
    setJobs((prevJobs) => {
      const updated = prevJobs.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            status: newStatus,
            currentPrintingPage: newStatus === 'Printing' ? (j.currentPrintingPage || 1) : j.currentPrintingPage,
            progressPercent: newStatus === 'Printing' ? (j.progressPercent || 8) : j.progressPercent,
            statusReason:
              newStatus === 'Printing'
                ? undefined
                : newStatus === 'Completed'
                ? undefined
                : j.statusReason
          };
        }
        return j;
      });
      updateSharedQueueJobs(updated);
      refreshSummaryStats(updated);
      return updated;
    });
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs((prev) => {
      const updated = prev.filter((j) => j.id !== jobId);
      updateSharedQueueJobs(updated);
      refreshSummaryStats(updated);
      return updated;
    });
  };

  const handleClearCompleted = () => {
    setJobs((prev) => {
      const updated = prev.filter((j) => j.status !== 'Completed');
      updateSharedQueueJobs(updated);
      refreshSummaryStats(updated);
      return updated;
    });
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setCountdown(5);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // Find currently printing job
  const currentPrintingJob =
    jobs.find((j) => j.status === 'Printing') || null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        storeInfo={mockStoreInfo}
        summary={mockSummaryBreakdown}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((prev) => !prev)}
        onOpenQRModal={() => setIsQRModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* Top Header matching reference */}
          <Header
            title="Queue"
            subtitle="Manage and monitor all print jobs"
            storeInfo={mockStoreInfo}
            isPrinterOnline={mockPrinterStatus.isOnline}
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
                isRefreshing={isRefreshing}
              />
            </div>
          </div>

          {/* Live Auto-refresh Ticker matching UI reference */}
          <div className="pt-2 pb-6 flex items-center justify-end">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isRefreshing ? 'animate-spin text-indigo-600' : 'text-slate-400'
                }`}
              />
              <span>
                Queue auto-refreshes every 5 seconds{' '}
                <span className="text-slate-400 font-mono text-[11px]">
                  ({countdown}s)
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
        printer={mockPrinterStatus}
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

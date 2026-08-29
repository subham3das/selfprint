import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { StatsGrid } from '../components/StatsCard';
import { QueueCard } from '../components/QueueCard';
import { PrinterStatus } from '../components/PrinterStatus';
import { ActivityCard } from '../components/ActivityCard';
import { StockAlertsCard } from '../components/StockAlertsCard';
import { SummaryCard } from '../components/SummaryCard';
import { JobDetailsModal } from '../components/JobDetailsModal';
import { QRGenerationModal } from '../components/QRGenerationModal';
import { PrinterSettingsModal } from '../components/PrinterSettingsModal';
import {
  mockStoreInfo,
  mockStatItems,
  mockQueueJobs,
  mockPrinterStatus,
  mockActivities,
  mockStockAlerts,
  mockSummaryBreakdown
} from '../data/dashboardData';
import { JobItem, QueueTab } from '../types/dashboard.types';

export const StoreDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Navigation & Tabs State
  const [activeNav, setActiveNav] = useState('dashboard');
  const [selectedQueueTab, setSelectedQueueTab] = useState<QueueTab>('All');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);


  // Printer & Store State
  const [isPaused, setIsPaused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(10);

  // Modals
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Auto-refresh simulation ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          setIsRefreshing(true);
          setTimeout(() => setIsRefreshing(false), 600);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleStatSelectTab = (tab: string) => {
    if (tab === 'Printing' || tab === 'Waiting') {
      setSelectedQueueTab(tab as QueueTab);
      // Smooth scroll down to queue section
      const queueEl = document.getElementById('recent-queue-section');
      if (queueEl) {
        queueEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleReprintJob = (job: JobItem) => {
    alert(`Sending job ${job.jobCode} (${job.fileName}) to HP LaserJet 1020...`);
  };

  const handleNavChange = (navId: string) => {
    setActiveNav(navId);
    if (navId === 'queue') {
      navigate('/store/queue');
    } else if (navId === 'history') {
      navigate('/store/history');
    } else if (navId === 'qr') {
      navigate('/store/qr');
    } else if (navId === 'settings') {
      navigate('/store/settings');
    } else if (navId === 'dashboard') {
      navigate('/store');
    }
  };





  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        storeInfo={mockStoreInfo}
        summary={mockSummaryBreakdown}
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
            storeInfo={mockStoreInfo}
            isPrinterOnline={mockPrinterStatus.isOnline}
            isPaused={isPaused}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            onOpenQRModal={() => setIsQRModalOpen(true)}
          />

          {/* Top 4 Stats Cards */}
          <StatsGrid
            stats={mockStatItems}
            onSelectTab={handleStatSelectTab}
          />

          {/* Middle Section: Recent Queue (8 cols) + Printer Status (4 cols) */}
          <div
            id="recent-queue-section"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          >
            <div className="lg:col-span-8 flex flex-col">
              <QueueCard
                jobs={mockQueueJobs}
                selectedTab={selectedQueueTab}
                onTabChange={setSelectedQueueTab}
                onViewJob={(job) => setSelectedJob(job)}
                onViewFullQueue={() => alert('Opening Full Queue view...')}
              />
            </div>
            <div className="lg:col-span-4 flex flex-col">
              <PrinterStatus
                printer={mockPrinterStatus}
                isPaused={isPaused}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </div>
          </div>

          {/* Bottom Section: Activity (4 cols) + Stock Alerts (4 cols) + Today's Summary (4 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <ActivityCard
              activities={mockActivities}
              onViewAll={() => alert('Opening all store activities...')}
            />
            <StockAlertsCard
              alerts={mockStockAlerts}
              onViewAll={() => alert('Opening stock inventory...')}
            />
            <SummaryCard summary={mockSummaryBreakdown} />
          </div>

          {/* Live Auto-refresh Ticker */}
          <div className="pt-2 pb-6 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isRefreshing ? 'animate-spin text-indigo-600' : 'text-slate-400'
                }`}
              />
              <span>
                Dashboard auto-refreshes every 10 seconds{' '}
                <span className="text-slate-400 font-mono text-[11px]">
                  ({refreshCountdown}s)
                </span>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Modals */}
      <JobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onReprint={handleReprintJob}
      />

      <QRGenerationModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        storeInfo={mockStoreInfo}
      />

      <PrinterSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        printer={mockPrinterStatus}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
      />
    </div>
  );
};

export default StoreDashboard;

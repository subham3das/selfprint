import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Monitor } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { StatsGrid } from '../components/StatsCard';
import { QueueCard } from '../components/QueueCard';
import { PrinterStatusMonitor } from '../components/printer/PrinterStatusMonitor';
import { PrinterNotifications } from '../components/printer/PrinterNotifications';
import { PrinterSetupWizard } from '../components/printer/PrinterSetupWizard';
import { ActivityCard } from '../components/ActivityCard';
import { StockAlertsCard } from '../components/StockAlertsCard';
import { SummaryCard } from '../components/SummaryCard';
import { JobDetailsModal } from '../components/JobDetailsModal';
import { QRGenerationModal } from '../components/QRGenerationModal';
import { PrinterSettingsModal } from '../components/PrinterSettingsModal';
import { NetworkErrorBanner } from '../../components/common/NetworkErrorBanner';
import { usePrinterMonitoring } from '../hooks/usePrinterMonitoring';
import { useStoreDashboard } from '../hooks/useStoreDashboard';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { printerService } from '../services/printer.service';
import { JobItem, QueueTab, StoreInfo, SummaryBreakdown, PrinterStatusInfo, StatItem } from '../types/dashboard.types';

const emptyStoreInfo: StoreInfo = {
  id: '',
  name: 'Store Partner',
  location: 'No location configured',
  storeCode: 'SP-0000',
  ownerName: '—',
  isOnline: false,
  isPaused: false
};

const emptySummary: SummaryBreakdown = {
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

const emptyStats: StatItem[] = [
  { id: 'jobs', title: "Today's Jobs", value: 0, trend: { value: '0%', isPositive: true, period: 'vs yesterday' }, variant: 'purple' },
  { id: 'revenue', title: "Today's Revenue", value: '₹0.00', trend: { value: '0%', isPositive: true, period: 'vs yesterday' }, variant: 'green' },
  { id: 'printing', title: 'Printing Now', value: 0, actionLabel: 'View in Queue', actionTab: 'Printing', variant: 'blue' },
  { id: 'waiting', title: 'Waiting in Queue', value: 0, actionLabel: 'View in Queue', actionTab: 'Waiting', variant: 'amber' }
];

const emptyPrinterStatus: PrinterStatusInfo = {
  name: 'No printer configured',
  model: 'Not Configured',
  isOnline: false,
  isConfigured: false,
  connectionStatus: 'Disconnected',
  printerStatus: 'Not Configured',
  paperSize: 'A4',
  tonerPercentage: 0,
  ipAddress: '—'
};

export const StoreDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Navigation & Tabs State
  const [activeNav, setActiveNav] = useState('dashboard');
  const [selectedQueueTab, setSelectedQueueTab] = useState<QueueTab>('All');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Backend Live Dashboard Integration Hook (TanStack Query with 10s auto-refresh)
  const { settings: storeSettings } = useStoreSettings();
  const {
    dashboardData,
    queueJobs,
    notifications: liveNotifications,
    unreadCount,
    isLoading,
    isError,
    error,
    isFetching,
    refreshCountdown,
    refetchAll
  } = useStoreDashboard(undefined, selectedQueueTab);

  // Printer Monitoring & Detection Hook (realtime port 4500 + Socket.IO)
  const {
    activePrinter,
    setActivePrinter,
    isConnectorOnline,
    connectionState,
    checkHost,
    notifications: hardwareNotifications,
    dismissNotification,
    triggerMockEvent,
    restartSpooler
  } = usePrinterMonitoring();

  // Printer & Store State
  const [isPaused, setIsPaused] = useState(false);

  // Modals
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPrinterWizardOpen, setIsPrinterWizardOpen] = useState(false);

  // Auto-launch printer wizard if no printer configured and not suppressed
  useEffect(() => {
    if (!dashboardData) return;

    const isFirstLogin = dashboardData.store?.isFirstLogin ?? true;
    const printerConfigured = dashboardData.store?.printerConfigured ?? false;
    const isSuppressed = printerService.isWizardSuppressed();

    if (!printerConfigured) {
      printerService.clearSavedPrinter();
    }

    if ((isFirstLogin || !printerConfigured) && !isSuppressed) {
      const timer = setTimeout(() => {
        setIsPrinterWizardOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dashboardData]);

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleStatSelectTab = (tab: string) => {
    if (tab === 'Printing' || tab === 'Waiting') {
      setSelectedQueueTab(tab as QueueTab);
      const queueEl = document.getElementById('recent-queue-section');
      if (queueEl) {
        queueEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleReprintJob = (job: JobItem) => {
    alert(`Sending job ${job.jobCode} (${job.fileName}) to printer...`);
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

  // Pure backend-driven data (empty DB state is handled gracefully with 0s and empty lists)
  const storeInfo: StoreInfo = dashboardData?.store ?? emptyStoreInfo;
  const summary: SummaryBreakdown = dashboardData?.summary ?? emptySummary;
  const stats = (dashboardData?.stats && dashboardData.stats.length > 0) ? dashboardData.stats : emptyStats;
  const displayQueueJobs: JobItem[] = queueJobs.length > 0 ? queueJobs : (dashboardData?.recentQueue ?? []);
  const activities = dashboardData?.activities ?? [];
  const stockAlerts = dashboardData?.stockAlerts ?? [];
    const printerStatus: PrinterStatusInfo = dashboardData?.printer
    ? {
        name: dashboardData.printer.name,
        model: dashboardData.printer.model,
        isOnline: dashboardData.printer.isOnline,
        isConfigured: (dashboardData.printer as any).isConfigured ?? (dashboardData.printer.printerStatus !== 'Not Configured'),
        connectionStatus: dashboardData.printer.connectionStatus,
        printerStatus: dashboardData.printer.printerStatus as any,
        paperSize: dashboardData.printer.paperSize,
        tonerPercentage: dashboardData.printer.tonerPercentage,
        ipAddress: dashboardData.printer.ipAddress
      }
    : emptyPrinterStatus;

  const isTestMode = Boolean(
    storeSettings?.printer?.testMode ||
    (dashboardData as any)?.settings?.printer?.testMode ||
    (printerStatus as any)?.isVirtual ||
    printerStatus?.name?.toLowerCase().includes('pdf') ||
    printerStatus?.name?.toLowerCase().includes('xps')
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        storeInfo={storeInfo}
        summary={summary}
        printerStatus={printerStatus}
        isPrinterConfigured={printerStatus.isConfigured}
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
            storeInfo={storeInfo}
            isPrinterOnline={printerStatus.isOnline}
            isPrinterConfigured={printerStatus.isConfigured}
            isPaused={isPaused}
            connectionState={connectionState}
            notificationsList={liveNotifications}
            unreadCount={unreadCount}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            onOpenQRModal={() => setIsQRModalOpen(true)}
          />

          {/* Test Mode Yellow Alert Banner */}
          {isTestMode && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl shadow-xs flex items-center justify-between gap-3 text-amber-900 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span>TEST MODE ENABLED</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 border border-amber-300">
                      🟡 TEST MODE
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Virtual printer is active. No physical printer is required. Generated test files are saved into <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-900">Documents \ SelfPrint \ Test Prints</code>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/store/settings')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer"
              >
                Settings
              </button>
            </div>
          )}

          {/* Error Banner with Retry (Only shown on actual offline/server errors, NEVER on empty database) */}
          {isError && (
            <NetworkErrorBanner
              error={error}
              onRetry={refetchAll}
            />
          )}

          {/* Loading Skeletons */}
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 h-80 bg-slate-200 rounded-2xl" />
                <div className="lg:col-span-4 h-80 bg-slate-200 rounded-2xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Top 4 Stats Cards */}
              <StatsGrid
                stats={stats}
                onSelectTab={handleStatSelectTab}
              />

              {/* Middle Section: Recent Queue (8 cols) + Printer Status (4 cols) */}
              <div
                id="recent-queue-section"
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
              >
                <div className="lg:col-span-8 flex flex-col">
                  <QueueCard
                    jobs={displayQueueJobs}
                    selectedTab={selectedQueueTab}
                    onTabChange={setSelectedQueueTab}
                    onViewJob={(job) => setSelectedJob(job)}
                    onViewFullQueue={() => navigate('/store/queue')}
                  />
                </div>
                <div className="lg:col-span-4 flex flex-col">
                  <PrinterStatusMonitor
                    printer={
                      isConnectorOnline && (dashboardData?.store?.printerConfigured ?? printerStatus.isConfigured)
                        ? (activePrinter.id ? activePrinter : (printerStatus as any))
                        : (printerStatus as any)
                    }
                    isConfigured={dashboardData?.store?.printerConfigured ?? printerStatus.isConfigured}
                    isPaused={isPaused}
                    isConnectorOnline={isConnectorOnline}
                    connectionState={connectionState}
                    onRefreshConnector={checkHost}
                    onTogglePause={handleTogglePause}
                    onOpenWizard={() => setIsPrinterWizardOpen(true)}
                    onRunTestPrint={async () => {
                      await printerService.sendTestPrint(activePrinter.id || printerStatus.id || '');
                    }}
                    onRestartSpooler={restartSpooler}
                    onTriggerEvent={triggerMockEvent}
                  />
                </div>
              </div>

              {/* Bottom Section: Activity (4 cols) + Stock Alerts (4 cols) + Today's Summary (4 cols) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                <ActivityCard
                  activities={activities}
                  onViewAll={() => alert('Opening all store activities...')}
                />
                <StockAlertsCard
                  alerts={stockAlerts}
                  onViewAll={() => alert('Opening stock inventory...')}
                />
                <SummaryCard summary={summary} />
              </div>
            </>
          )}

          {/* Live Auto-refresh Ticker */}
          <div className="pt-2 pb-6 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isFetching ? 'animate-spin text-indigo-600' : 'text-slate-400'
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
        storeInfo={storeInfo}
      />

      <PrinterSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        printer={printerStatus}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
      />

      {/* Production-Level Printer Setup Wizard Modal */}
      <PrinterSetupWizard
        isOpen={isPrinterWizardOpen}
        onClose={() => setIsPrinterWizardOpen(false)}
        onPrinterConfigured={(configuredPrinter) => {
          setActivePrinter(configuredPrinter);
          setIsPrinterWizardOpen(false);
          refetchAll();
        }}
      />

      {/* Floating Real-time Printer Notifications */}
      <PrinterNotifications
        notifications={hardwareNotifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
};

export default StoreDashboard;

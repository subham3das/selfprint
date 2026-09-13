import { useRuntimeStore } from '../stores/useRuntimeStore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { TransactionStatsGrid } from '../components/history/TransactionStatsGrid';
import { TransactionTableCard } from '../components/history/TransactionTableCard';
import { DailyIncomeChart } from '../components/history/DailyIncomeChart';
import { PaymentBreakdownCard } from '../components/history/PaymentBreakdownCard';
import { TransactionDetailsModal } from '../components/history/TransactionDetailsModal';
import { TransactionFilterModal } from '../components/history/TransactionFilterModal';
import { TransactionExportModal } from '../components/history/TransactionExportModal';
import { PrinterSettingsModal } from '../components/PrinterSettingsModal';
import { QRPosterModal } from '../components/qr/QRPosterModal';
import { PrinterStatusInfo, SummaryBreakdown } from '../types/dashboard.types';
import { useStoreSession } from '../hooks/useStoreSession';
import { useStoreDashboard } from '../hooks/useStoreDashboard';
import { useStoreHistory } from '../hooks/useStoreHistory';
import { initialQRConfig } from '../data/qrData';
import {
  TransactionItem,
  TransactionFilters
} from '../types/transaction.types';

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

export const TransactionHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const storeInfo = useStoreSession();

  const [chartPeriod, setChartPeriod] = useState('Last 7 Days');
  const [activeNav, setActiveNav] = useState('history');
  const [isPaused, setIsPaused] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const runtime = useRuntimeStore();

  // Filter State
  const [filters, setFilters] = useState<TransactionFilters>({
    searchQuery: '',
    dateRange: 'today',
    paymentStatus: 'All',
    paymentMethod: 'All',
    colorMode: 'All',
    paperSize: 'All',
    sortBy: 'newest'
  });

  // Modals
  const [selectedTxnForModal, setSelectedTxnForModal] =
    useState<TransactionItem | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // 1. Live Store Dashboard Overview
  const { dashboardData } = useStoreDashboard();

  // 2. Live Store Transaction History from MongoDB
  const {
    transactions,
    summary,
    incomeData,
    paymentBreakdown
  } = useStoreHistory(
    {
      search: filters.searchQuery,
      dateRange: filters.dateRange,
      paymentStatus: filters.paymentStatus,
      paymentMethod: filters.paymentMethod,
      colorMode: filters.colorMode,
      paperSize: filters.paperSize,
      sortBy: filters.sortBy
    },
    chartPeriod,
    filters.dateRange
  );

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

  const handleApplyFilters = (updated: Partial<TransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      dateRange: 'today',
      paymentStatus: 'All',
      paymentMethod: 'All',
      colorMode: 'All',
      paperSize: 'All',
      sortBy: 'newest'
    });
  };

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
        onTogglePause={() => setIsPaused((prev) => !prev)}
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
            title="Transaction History"
            subtitle="View all transactions and store income"
            storeInfo={storeInfo}
            isPrinterOnline={isPrinterOnline}
            isPrinterConfigured={isPrinterConfigured}
            isPaused={isPaused}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            onOpenQRModal={() => setIsQRModalOpen(true)}
          />

          {/* Top 5 Financial Summary Cards */}
          <TransactionStatsGrid summary={summary} />

          {/* Middle: All Transactions Table Card */}
          <TransactionTableCard
            transactions={transactions}
            filters={filters}
            onFilterChange={handleApplyFilters}
            onOpenFilterModal={() => setIsFilterModalOpen(true)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onViewDetails={(txn) => setSelectedTxnForModal(txn)}
          />

          {/* Bottom Grid: Daily Income Overview (7 cols) + Payment Method Breakdown (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pb-6">
            <div className="lg:col-span-7 flex flex-col">
              <DailyIncomeChart
                data={incomeData}
                period={chartPeriod}
                onPeriodChange={setChartPeriod}
              />
            </div>
            <div className="lg:col-span-5 flex flex-col">
              <PaymentBreakdownCard
                breakdown={paymentBreakdown}
                totalRevenue={summary.totalRevenue}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Modals */}
      <TransactionDetailsModal
        transaction={selectedTxnForModal}
        onClose={() => setSelectedTxnForModal(null)}
      />

      <TransactionFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      <TransactionExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
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

export default TransactionHistoryPage;

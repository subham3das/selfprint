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
import {
  mockStoreInfo,
  mockPrinterStatus,
  mockSummaryBreakdown
} from '../data/dashboardData';
import { initialQRConfig } from '../data/qrData';
import {
  initialTransactions,
  initialFinancialSummary,
  initialDailyIncomePoints,
  initialPaymentBreakdown
} from '../data/transactionData';
import {
  TransactionItem,
  TransactionFilters,
  FinancialSummary,
  DailyIncomePoint,
  PaymentBreakdownItem
} from '../types/transaction.types';

export const TransactionHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [transactions] = useState<TransactionItem[]>(initialTransactions);
  const [summary] = useState<FinancialSummary>(initialFinancialSummary);
  const [incomeData] = useState<DailyIncomePoint[]>(
    initialDailyIncomePoints
  );
  const [paymentBreakdown] = useState<PaymentBreakdownItem[]>(
    initialPaymentBreakdown
  );
  const [chartPeriod, setChartPeriod] = useState('Last 7 Days');

  const [activeNav, setActiveNav] = useState('history');
  const [isPaused, setIsPaused] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
            title="Transaction History"
            subtitle="View all transactions and store income"
            storeInfo={mockStoreInfo}
            isPrinterOnline={mockPrinterStatus.isOnline}
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

export default TransactionHistoryPage;

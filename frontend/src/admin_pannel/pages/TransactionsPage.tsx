import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AdminNavRoute } from '../types/admin.types';
import { useTransactions } from '../hooks/useTransactions';
import { AdminSidebar } from '../components/Sidebar/AdminSidebar';
import { AdminHeader } from '../components/Header/AdminHeader';
import { TransactionStatsCards } from '../components/TransactionStatsCards';
import { TransactionFilters } from '../components/TransactionFilters';
import { TransactionsTable } from '../components/TransactionsTable';
import { TransactionPagination } from '../components/TransactionPagination';
import { TransactionViewModal } from '../components/TransactionViewModal';
import { RefundModal } from '../components/RefundModal';

export const AdminTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState<AdminNavRoute>('transactions');
  const [headerSearch, setHeaderSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('29 May 2025');

  const {
    filters,
    setFilters,
    uniqueStores,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    paginatedTransactions,
    resetFilters,
    handleExport,
    stats,
    viewingTransaction,
    setViewingTransaction,
    refundingTransaction,
    setRefundingTransaction,
    handleProcessRefund,
    handleDeleteTransaction
  } = useTransactions();

  const handleSidebarNav = (route: AdminNavRoute) => {
    setActiveRoute(route);
    if (route === 'dashboard') {
      navigate('/admin/dashboard');
    } else if (route === 'stores') {
      navigate('/admin/stores');
    } else if (route === 'users') {
      navigate('/admin/users');
    } else if (route === 'transactions') {
      navigate('/admin/transactions');
    } else if (route === 'revenue') {
      navigate('/admin/revenue');
    } else if (route === 'printers') {
      navigate('/admin/printers');
    } else if (route === 'analytics') {
      navigate('/admin/analytics');
    } else if (route === 'support') {
      navigate('/admin/support');
    } else if (route === 'access') {
      navigate('/admin/access');
    } else if (route === 'audit') {
      navigate('/admin/audit-logs');
    } else if (route === 'settings') {
      navigate('/admin/settings');
    }


  };





  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-900 flex font-sans antialiased">
      {/* Left Fixed Sidebar */}
      <AdminSidebar
        activeRoute={activeRoute}
        onRouteChange={handleSidebarNav}
      />

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col min-w-0 pl-64 transition-all duration-300">
        <div className="w-full max-w-[1680px] mx-auto p-4 sm:p-6 lg:p-7 flex flex-col gap-5">
          {/* Top Header Bar */}
          <AdminHeader
            showWelcome={false}
            title="Transactions"
            breadcrumb={[
              { label: 'Dashboard', path: '/admin/dashboard' },
              { label: 'Transactions' }
            ]}
            searchQuery={headerSearch}
            onSearchChange={setHeaderSearch}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* 6 Top Statistics Cards */}
          <TransactionStatsCards stats={stats} />

          {/* Filters Bar */}
          <TransactionFilters
            filters={filters}
            onFilterChange={(newF) => {
              setFilters((prev) => ({ ...prev, ...newF }));
              setCurrentPage(1);
            }}
            onReset={resetFilters}
            onExport={handleExport}
            uniqueStores={uniqueStores}
          />

          {/* Transactions Table */}
          <TransactionsTable
            transactions={paginatedTransactions}
            onViewTransaction={(t) => setViewingTransaction(t)}
            onRefundTransaction={(t) => setRefundingTransaction(t)}
            onDeleteTransaction={handleDeleteTransaction}
          />

          {/* Pagination Controls */}
          <TransactionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />

          {/* Footer */}
          <footer className="w-full py-4 text-center text-xs text-slate-400 font-medium border-t border-slate-200/60 mt-2">
            © 2025 Self Print Platform. All rights reserved.
          </footer>
        </div>
      </main>

      {/* Modals Container */}
      <AnimatePresence>
        {/* Transaction View Details Modal */}
        {viewingTransaction && (
          <TransactionViewModal
            transaction={viewingTransaction}
            onClose={() => setViewingTransaction(null)}
            onRefund={(t) => setRefundingTransaction(t)}
          />
        )}

        {/* Refund Modal */}
        {refundingTransaction && (
          <RefundModal
            transaction={refundingTransaction}
            onClose={() => setRefundingTransaction(null)}
            onConfirmRefund={handleProcessRefund}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTransactionsPage;

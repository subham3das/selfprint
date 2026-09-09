import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { AdminNavRoute } from '../types/admin.types';
import { usePrinters } from '../hooks/usePrinters';
import { AdminSidebar } from '../components/Sidebar/AdminSidebar';
import { AdminHeader } from '../components/Header/AdminHeader';
import { PrinterStatsCards } from '../components/PrinterStatsCards';
import { PrinterFilters } from '../components/PrinterFilters';
import { PrintersTable } from '../components/PrintersTable';
import { PrinterPagination } from '../components/PrinterPagination';
import { ViewPrinterModal } from '../components/ViewPrinterModal';
import { RegisterPrinterModal } from '../components/RegisterPrinterModal';
import { EditPrinterModal } from '../components/EditPrinterModal';
import { TestPrintModal } from '../components/TestPrintModal';

export const AdminPrintersPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState<AdminNavRoute>('printers');
  const [headerSearch, setHeaderSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('Today (Live)');

  const {
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
    error,
    refetch,
    uniqueStores,
    uniqueCities,
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
  } = usePrinters();

  const handleSidebarNav = (route: AdminNavRoute) => {
    setActiveRoute(route);
    if (route === 'dashboard') navigate('/admin/dashboard');
    else if (route === 'stores') navigate('/admin/stores');
    else if (route === 'users') navigate('/admin/users');
    else if (route === 'transactions') navigate('/admin/transactions');
    else if (route === 'revenue') navigate('/admin/revenue');
    else if (route === 'printers') navigate('/admin/printers');
    else if (route === 'analytics') navigate('/admin/analytics');
    else if (route === 'support') navigate('/admin/support');
    else if (route === 'access') navigate('/admin/access');
    else if (route === 'audit') navigate('/admin/audit-logs');
    else if (route === 'settings') navigate('/admin/settings');
  };

  const errObj = error as any;
  const errorStatus = errObj?.response?.status || 'Connection Error';
  const errorMessage =
    errObj?.response?.data?.message ||
    errObj?.message ||
    'Unable to connect to MongoDB printers backend service.';

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
            title="Printers"
            breadcrumb={[
              { label: 'Dashboard', path: '/admin/dashboard' },
              { label: 'Printers' }
            ]}
            searchQuery={headerSearch}
            onSearchChange={(q) => {
              setHeaderSearch(q);
              setFilters((prev) => ({ ...prev, searchQuery: q }));
              setCurrentPage(1);
            }}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* Error State Banner */}
          {isError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <p className="text-xs font-bold text-rose-900">
                    Failed to load printers ({errorStatus}): {errorMessage}
                  </p>
                  <p className="text-[11px] text-rose-600 font-mono mt-0.5">
                    Endpoint: /api/v1/admin/printers
                  </p>
                </div>
              </div>
              <button
                onClick={() => refetch()}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Request</span>
              </button>
            </div>
          )}

          {/* 6 Top KPI Metric Cards */}
          <PrinterStatsCards stats={stats} isLoading={isLoading} />

          {/* Filter Bar */}
          <PrinterFilters
            filters={filters}
            onFilterChange={(newF) => {
              setFilters((prev) => ({ ...prev, ...newF }));
              setCurrentPage(1);
            }}
            onReset={resetFilters}
            onAddNewPrinter={() => setIsRegisterModalOpen(true)}
            uniqueStores={uniqueStores}
            uniqueCities={uniqueCities}
          />

          {/* Printers Table */}
          <PrintersTable
            printers={paginatedPrinters}
            isLoading={isLoading}
            onViewPrinter={setViewingPrinter}
            onEditPrinter={setEditingPrinter}
            onRestartPrinter={handleRestartPrinter}
            onTestPrint={setTestPrintingPrinter}
            onTogglePause={handleTogglePrintingPause}
            onDeletePrinter={handleDeletePrinter}
          />

          {/* Pagination */}
          <PrinterPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalFilteredCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />

          {/* Footer */}
          <footer className="w-full py-4 text-center text-xs text-slate-400 font-medium border-t border-slate-200/60 mt-2">
            © {new Date().getFullYear()} Self Print Platform. All rights reserved.
          </footer>
        </div>
      </main>

      {/* Modals Suite */}
      <ViewPrinterModal
        printer={viewingPrinter}
        onClose={() => setViewingPrinter(null)}
        onEdit={(p) => {
          setViewingPrinter(null);
          setEditingPrinter(p);
        }}
        onRestart={handleRestartPrinter}
        onTestPrint={(p) => {
          setViewingPrinter(null);
          setTestPrintingPrinter(p);
        }}
      />

      <RegisterPrinterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleRegisterPrinter}
        uniqueStores={uniqueStores}
      />

      <EditPrinterModal
        printer={editingPrinter}
        onClose={() => setEditingPrinter(null)}
        onSubmit={handleUpdatePrinter}
      />

      <TestPrintModal
        printer={testPrintingPrinter}
        onClose={() => setTestPrintingPrinter(null)}
        onConfirm={handleTestPrint}
      />
    </div>
  );
};

export default AdminPrintersPage;

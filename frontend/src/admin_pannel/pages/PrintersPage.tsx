import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [selectedDate, setSelectedDate] = useState('01 May 2025 - 29 May 2025');

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
            title="Printers"
            breadcrumb={[
              { label: 'Dashboard', path: '/admin/dashboard' },
              { label: 'Printers' }
            ]}
            searchQuery={headerSearch}
            onSearchChange={setHeaderSearch}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* 6 Top KPI Metric Cards */}
          <PrinterStatsCards stats={stats} />

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

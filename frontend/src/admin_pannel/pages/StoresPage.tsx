import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AdminNavRoute } from '../types/admin.types';
import { useStores } from '../hooks/useStores';
import { AdminSidebar } from '../components/Sidebar/AdminSidebar';
import { AdminHeader } from '../components/Header/AdminHeader';
import { StoreStatsCards } from '../components/StoreStatsCards';
import { StoreFilters } from '../components/StoreFilters';
import { StoreTable } from '../components/StoreTable';
import { StorePagination } from '../components/StorePagination';
import { StoreViewModal } from '../components/StoreViewModal';
import { StoreEditModal } from '../components/StoreEditModal';
import { StoreCreateModal } from '../components/StoreCreateModal';

export const AdminStoresPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState<AdminNavRoute>('stores');
  const [headerSearch, setHeaderSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('29 May 2025');

  const {
    filters,
    setFilters,
    uniqueCities,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    paginatedStores,
    resetFilters,
    stats,
    viewingStore,
    setViewingStore,
    editingStore,
    setEditingStore,
    isCreateModalOpen,
    setIsCreateModalOpen,
    handleCreateStore,
    handleUpdateStore,
    handleToggleStoreStatus,
    handleDeleteStore
  } = useStores();

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
          {/* Header Bar with Title, Breadcrumb and Right Controls */}
          <AdminHeader
            showWelcome={false}
            title="Stores"
            breadcrumb={[
              { label: 'Dashboard', path: '/admin/dashboard' },
              { label: 'Stores' }
            ]}
            searchQuery={headerSearch}
            onSearchChange={setHeaderSearch}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* 6 Top Statistics Cards */}
          <StoreStatsCards stats={stats} />

          {/* Filters Bar */}
          <StoreFilters
            filters={filters}
            onFilterChange={(newF) => {
              setFilters((prev) => ({ ...prev, ...newF }));
              setCurrentPage(1);
            }}
            onReset={resetFilters}
            onAddNewStore={() => setIsCreateModalOpen(true)}
            uniqueCities={uniqueCities}
          />

          {/* Stores Table */}
          <StoreTable
            stores={paginatedStores}
            onViewStore={(s) => setViewingStore(s)}
            onEditStore={(s) => setEditingStore(s)}
            onToggleStatus={handleToggleStoreStatus}
            onDeleteStore={handleDeleteStore}
            onGenerateQr={(s) => setViewingStore(s)}
          />

          {/* Pagination Controls */}
          <StorePagination
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
        {/* View Store Modal */}
        {viewingStore && (
          <StoreViewModal
            store={viewingStore}
            onClose={() => setViewingStore(null)}
            onEdit={(s) => setEditingStore(s)}
          />
        )}

        {/* Edit Store Modal */}
        {editingStore && (
          <StoreEditModal
            store={editingStore}
            onClose={() => setEditingStore(null)}
            onSave={handleUpdateStore}
          />
        )}

        {/* Create Store Modal */}
        {isCreateModalOpen && (
          <StoreCreateModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreateStore}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStoresPage;

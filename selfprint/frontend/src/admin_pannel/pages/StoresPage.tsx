import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { AdminNavRoute } from '../types/admin.types';
import { AdminStoreItem } from '../types/store.types';
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
import { StoreDeleteModal } from '../components/StoreDeleteModal';
import { StoreBlockModal } from '../components/StoreBlockModal';

export const AdminStoresPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState<AdminNavRoute>('stores');
  const [selectedDate, setSelectedDate] = useState('Today (Live)');

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
    isLoading,
    isStatsLoading,
    isError,
    error,
    refetch,
    stats,
    viewingStore,
    setViewingStore,
    editingStore,
    setEditingStore,
    blockingStore,
    setBlockingStore,
    deletingStore,
    setDeletingStore,
    isCreateModalOpen,
    setIsCreateModalOpen,
    handleCreateStore,
    handleUpdateStore,
    handleBlockStore,
    handleUnblockStore,
    handleDeleteStore,
    isBlockingLoading,
    isDeletingLoading
  } = useStores();

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

  const handleHeaderSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
    setCurrentPage(1);
  };

  // Format detailed error message
  const errObj = error as any;
  const errorStatus = errObj?.response?.status || 'Connection Error';
  const errorMessage =
    errObj?.response?.data?.message ||
    errObj?.message ||
    'Unable to connect to MongoDB backend service.';
  const requestedUrl = errObj?.config?.url || '/api/v1/admin/stores';

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
            searchQuery={filters.searchQuery}
            onSearchChange={handleHeaderSearch}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* 6 Top Statistics Cards */}
          <StoreStatsCards stats={stats} isLoading={isStatsLoading} />

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

          {/* Error State Banner */}
          {isError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <p className="text-xs font-bold text-rose-900">
                    Failed to load stores (Status {errorStatus}): {errorMessage}
                  </p>
                  <p className="text-[11px] text-rose-600 font-mono mt-0.5">
                    Endpoint: {requestedUrl}
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

          {/* Stores Table */}
          {isLoading ? (
            <div className="p-16 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-600">Loading stores from MongoDB...</p>
            </div>
          ) : (
            <StoreTable
              stores={paginatedStores}
              onViewStore={(s: AdminStoreItem) => setViewingStore(s)}
              onEditStore={(s: AdminStoreItem) => setEditingStore(s)}
              onBlockStore={(s: AdminStoreItem) => setBlockingStore(s)}
              onUnblockStore={(s: AdminStoreItem) => handleUnblockStore(s.id)}
              onDeleteStore={(s: AdminStoreItem) => setDeletingStore(s)}
            />
          )}

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
            © {new Date().getFullYear()} Self Print Enterprise Platform. All rights reserved.
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

        {/* Block Store Modal */}
        {blockingStore && (
          <StoreBlockModal
            store={blockingStore}
            isOpen={Boolean(blockingStore)}
            isLoading={isBlockingLoading}
            onClose={() => setBlockingStore(null)}
            onConfirmBlock={(storeId, reason) => handleBlockStore(storeId, reason)}
          />
        )}

        {/* Permanent Delete Store Modal */}
        {deletingStore && (
          <StoreDeleteModal
            store={deletingStore}
            isOpen={Boolean(deletingStore)}
            isLoading={isDeletingLoading}
            onClose={() => setDeletingStore(null)}
            onConfirmDelete={(storeId) => handleDeleteStore(storeId)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStoresPage;

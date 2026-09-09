import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AdminNavRoute } from '../types/admin.types';
import { useUsers } from '../hooks/useUsers';
import { AdminSidebar } from '../components/Sidebar/AdminSidebar';
import { AdminHeader } from '../components/Header/AdminHeader';
import { UsersStatsCards } from '../components/UsersStatsCards';
import { UsersFilters } from '../components/UsersFilters';
import { UsersTable } from '../components/UsersTable';
import { UsersPagination } from '../components/UsersPagination';
import { UserProfileModal } from '../components/UserProfileModal';
import { EditUserModal } from '../components/EditUserModal';
import { NetworkErrorBanner } from '../../components/common/NetworkErrorBanner';

export const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState<AdminNavRoute>('users');
  const [headerSearch, setHeaderSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('29 May 2025');

  const {
    filters,
    setFilters,
    uniqueStores,
    uniqueCities,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    paginatedUsers,
    resetFilters,
    handleExportUsers,
    stats,
    isLoading,
    isError,
    error,
    selectedUserProfile,
    setSelectedUserProfile,
    handleOpenUserProfile,
    editingUser,
    setEditingUser,
    handleUpdateUser,
    handleToggleUserStatus,
    handleDeleteUser,
    refetchAll
  } = useUsers();

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
            title="Users"
            breadcrumb={[
              { label: 'Dashboard', path: '/admin/dashboard' },
              { label: 'Users' }
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

          {/* Error Banner with Retry (Only shown on actual offline/server errors, NEVER on empty database) */}
          {isError && (
            <NetworkErrorBanner
              error={error}
              onRetry={refetchAll}
            />
          )}

          {/* 6 Top Statistics Cards */}
          <UsersStatsCards stats={stats} />

          {/* Filters Bar */}
          <UsersFilters
            filters={filters}
            onFilterChange={(newF) => {
              setFilters((prev) => ({ ...prev, ...newF }));
              setCurrentPage(1);
            }}
            onReset={resetFilters}
            onExport={handleExportUsers}
            uniqueStores={uniqueStores}
            uniqueCities={uniqueCities}
          />

          {/* Loading Skeleton vs Users Table */}
          {isLoading ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-pulse space-y-4">
              <div className="h-8 bg-slate-100 rounded-xl w-full" />
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-50 rounded-xl w-full" />
              ))}
            </div>
          ) : (
            <UsersTable
              users={paginatedUsers}
              onViewUser={(u) => handleOpenUserProfile(u)}
              onEditUser={(u) => setEditingUser(u)}
              onToggleStatus={handleToggleUserStatus}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {/* Pagination Controls */}
          <UsersPagination
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
        {/* User Profile Modal */}
        {selectedUserProfile && (
          <UserProfileModal
            user={selectedUserProfile}
            onClose={() => setSelectedUserProfile(null)}
            onEdit={(u) => setEditingUser(u)}
          />
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={handleUpdateUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsersPage;

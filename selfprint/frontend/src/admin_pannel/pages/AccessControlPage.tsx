import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { AdminNavRoute } from '../types/admin.types';
import { useAccess } from '../hooks/useAccess';
import { AdminSidebar } from '../components/Sidebar/AdminSidebar';
import { AdminHeader } from '../components/Header/AdminHeader';
import { AccessStatsCards } from '../components/AccessStatsCards';
import { AccessFilters } from '../components/AccessFilters';
import { AccessTable } from '../components/AccessTable';
import { InviteStaffModal } from '../components/InviteStaffModal';
import { EditStaffModal } from '../components/EditStaffModal';
import { ViewStaffModal } from '../components/ViewStaffModal';
import { AuditLogsModal } from '../components/AuditLogsModal';
import { StaffMember } from '../types/access.types';

export const AdminAccessControlPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState<AdminNavRoute>('access');
  const [headerSearch, setHeaderSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('Today (Live)');

  const {
    paginatedStaff,
    totalFilteredCount,
    stats,
    auditLogs,
    filterOptions,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    isInviteModalOpen,
    setIsInviteModalOpen,
    inviteErrors,
    isInviteSubmitting,
    isEditModalOpen,
    setIsEditModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    isAuditModalOpen,
    setIsAuditModalOpen,
    selectedStaff,
    setSelectedStaff,
    toastMessage,
    handleInviteStaff,
    handleResendInvite,
    handleCopyInviteLink,
    handleCancelInvite,
    handleEditStaff,
    handleToggleStatus,
    handleDeleteStaff,
    handleDuplicatePermissions,
    handleResetPassword,
    handleResetFilters
  } = useAccess();



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

  const handleOpenViewModal = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsViewModalOpen(true);
  };

  const handleOpenEditModal = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsEditModalOpen(true);
  };

  const errObj = error as any;
  const errorStatus = errObj?.response?.status || 'Connection Error';
  const errorMessage =
    errObj?.response?.data?.message ||
    errObj?.message ||
    'Unable to connect to MongoDB access control backend service.';

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
            title="Access Control"
            breadcrumb={[
              { label: 'Dashboard', path: '/admin/dashboard' },
              { label: 'Access Control' }
            ]}
            searchQuery={headerSearch}
            onSearchChange={setHeaderSearch}
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
                    Failed to load access directory ({errorStatus}): {errorMessage}
                  </p>
                  <p className="text-[11px] text-rose-600 font-mono mt-0.5">
                    Endpoint: /api/v1/admin/access
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

          {/* Row 1: 6 Top KPI Metrics Cards */}
          <AccessStatsCards stats={stats} isLoading={isLoading} />

          {/* Row 2: Search, Filters & Action Toolbar */}
          <AccessFilters
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
            onInviteClick={() => {
              setSelectedStaff(null);
              setIsInviteModalOpen(true);
            }}
            onAuditLogsClick={() => setIsAuditModalOpen(true)}
          />

          {/* Row 3: Staff Access Table & Pagination */}
          <AccessTable
            staffList={paginatedStaff}
            totalStaffCount={totalFilteredCount}
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            isLoading={isLoading}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onView={handleOpenViewModal}
            onEdit={handleOpenEditModal}
            onDuplicate={handleDuplicatePermissions}
            onToggleStatus={handleToggleStatus}
            onResetPassword={handleResetPassword}
            onDelete={handleDeleteStaff}
            onResendInvite={handleResendInvite}
            onCopyInviteLink={handleCopyInviteLink}
            onCancelInvite={handleCancelInvite}
          />


          {/* Footer */}
          <div className="pt-4 pb-2 text-center text-xs text-slate-400 font-medium">
            <p>© {new Date().getFullYear()} Self Print Platform • RBAC Security Engine</p>
          </div>
        </div>
      </main>

      {/* Modals Suite */}
      <InviteStaffModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteStaff}
        initialRole={selectedStaff ? selectedStaff.role : 'Admin'}
        initialPermissions={selectedStaff ? selectedStaff.permissions : undefined}
        serverErrors={inviteErrors}
        isSubmitting={isInviteSubmitting}
      />


      <EditStaffModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        staff={selectedStaff}
        onSave={handleEditStaff}
      />

      <ViewStaffModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        staff={selectedStaff}
        onEditClick={handleOpenEditModal}
      />

      <AuditLogsModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={auditLogs}
      />

      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAccessControlPage;

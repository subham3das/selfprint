import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { AdminNavRoute } from '../types/admin.types';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { AdminSidebar } from '../components/Sidebar/AdminSidebar';
import { AdminHeader } from '../components/Header/AdminHeader';
import { AuditStatsCards } from '../components/AuditStatsCards';
import { AuditFilters } from '../components/AuditFilters';
import { AuditTable } from '../components/AuditTable';
import { AuditTimeline } from '../components/AuditTimeline';
import { AuditHeatmap } from '../components/AuditHeatmap';
import { LoginLocationMap } from '../components/LoginLocationMap';
import { SecuritySummary } from '../components/SecuritySummary';
import { LiveEventsFeed } from '../components/LiveEventsFeed';
import { AuditDrawer } from '../components/AuditDrawer';

export const AdminAuditLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState<AdminNavRoute>('audit');
  const [headerSearch, setHeaderSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('Today (Live)');

  const {
    logs,
    paginatedLogs,
    totalFilteredCount,
    timelineGroups,
    stats,
    heatmapPoints,
    loginLocations,
    topAdmins,
    filterOptions,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    selectedEvent,
    isDrawerOpen,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    isLoading,
    isError,
    error,
    toastMessage,
    handleOpenDrawer,
    handleCloseDrawer,
    handleResetFilters,
    handleExport,
    handleRefresh
  } = useAuditLogs();

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
    'Unable to connect to MongoDB audit log security engine.';

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
            title="Audit Logs"
            breadcrumb={[
              { label: 'Dashboard', path: '/admin/dashboard' },
              { label: 'Audit Logs' }
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
                    Failed to stream audit logs ({errorStatus}): {errorMessage}
                  </p>
                  <p className="text-[11px] text-rose-600 font-mono mt-0.5">
                    Endpoint: /api/v1/admin/audit-logs
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRefresh()}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Request</span>
              </button>
            </div>
          )}

          {/* Row 1: 6 Top KPI Metrics Cards */}
          <AuditStatsCards stats={stats} isLoading={isLoading} />

          {/* Row 2: Advanced Search, Multi-Filter Toolbar & View Switcher */}
          <AuditFilters
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onReset={handleResetFilters}
            onRefresh={handleRefresh}
            onExport={handleExport}
          />

          {/* Row 3: Main Dynamic Content Area based on View Mode */}
          {viewMode === 'table' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Full Audit Table (8 cols) */}
              <div className="lg:col-span-8">
                <AuditTable
                  logs={paginatedLogs}
                  totalCount={totalFilteredCount}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalPages={totalPages}
                  isLoading={isLoading}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  onRowClick={handleOpenDrawer}
                />
              </div>

              {/* Right Column: Security Widgets (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                <SecuritySummary stats={stats} topAdmins={topAdmins} />
                <LiveEventsFeed events={logs} onEventClick={handleOpenDrawer} />
              </div>
            </div>
          )}

          {viewMode === 'timeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Chronological Timeline (8 cols) */}
              <div className="lg:col-span-8">
                <AuditTimeline
                  timelineGroups={timelineGroups}
                  onEventClick={handleOpenDrawer}
                />
              </div>

              {/* Right Column: Security Widgets (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                <SecuritySummary stats={stats} topAdmins={topAdmins} />
                <LiveEventsFeed events={logs} onEventClick={handleOpenDrawer} />
              </div>
            </div>
          )}

          {viewMode === 'analytics' && (
            <div className="flex flex-col gap-5">
              {/* Heatmap & Regional Map */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                <div className="lg:col-span-7">
                  <AuditHeatmap points={heatmapPoints} />
                </div>
                <div className="lg:col-span-5">
                  <LoginLocationMap locations={loginLocations} />
                </div>
              </div>

              {/* Security Summary & Live Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                <div className="lg:col-span-6">
                  <SecuritySummary stats={stats} topAdmins={topAdmins} />
                </div>
                <div className="lg:col-span-6">
                  <LiveEventsFeed events={logs} onEventClick={handleOpenDrawer} />
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 pb-2 text-center text-xs text-slate-400 font-medium">
            <p>© {new Date().getFullYear()} Self Print Platform • Cryptographic Append-Only Security Ledger</p>
          </div>
        </div>
      </main>

      {/* Slide-Over Event Detail Drawer */}
      <AuditDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        event={selectedEvent}
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

export default AdminAuditLogsPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminNavRoute } from '../types/admin.types';
import { useSupport } from '../hooks/useSupport';
import { AdminSidebar } from '../components/Sidebar/AdminSidebar';
import { AdminHeader } from '../components/Header/AdminHeader';
import { SupportStatsCards } from '../components/SupportStatsCards';
import { SupportFilters } from '../components/SupportFilters';
import { SupportTable } from '../components/SupportTable';
import { SupportPagination } from '../components/SupportPagination';
import { SupportOverviewChart } from '../components/SupportOverviewChart';
import { RecentActivitiesCard } from '../components/RecentActivitiesCard';
import { IssueCategoriesCard } from '../components/IssueCategoriesCard';
import { ViewTicketModal } from '../components/ViewTicketModal';
import { ReplyTicketModal } from '../components/ReplyTicketModal';
import { AssignTicketModal } from '../components/AssignTicketModal';

export const AdminSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState<AdminNavRoute>('support');
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
    paginatedTickets,
    stats,
    recentActivities,
    issueCategories,
    supportOverviewSegments,
    viewingTicket,
    setViewingTicket,
    replyingTicket,
    setReplyingTicket,
    assigningTicket,
    setAssigningTicket,
    handleSendReply,
    handleAssignTicket,
    handleChangeStatus,
    handleDeleteTicket,
    resetFilters
  } = useSupport();

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
            title="Support"
            breadcrumb={[
              { label: 'Dashboard', path: '/admin/dashboard' },
              { label: 'Support' }
            ]}
            searchQuery={headerSearch}
            onSearchChange={setHeaderSearch}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* 6 Top KPI Metrics Cards with Sparklines */}
          <SupportStatsCards stats={stats} />

          {/* Filter Toolbar */}
          <SupportFilters
            filters={filters}
            onFilterChange={(newF) => {
              setFilters((prev) => ({ ...prev, ...newF }));
              setCurrentPage(1);
            }}
            onReset={resetFilters}
          />

          {/* 2-Column Content Grid: Table on Left (8 cols), Support Analytics & Feed on Right (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Main Support Tickets Ledger (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <SupportTable
                tickets={paginatedTickets}
                onViewTicket={setViewingTicket}
                onReplyTicket={setReplyingTicket}
                onAssignTicket={setAssigningTicket}
                onChangeStatus={handleChangeStatus}
                onDeleteTicket={handleDeleteTicket}
              />

              <SupportPagination
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

            {/* Right Dedicated Support Analytics Cards (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              {/* Support Overview Donut Chart */}
              <SupportOverviewChart segments={supportOverviewSegments} />

              {/* Recent Activities Live Audit Feed */}
              <RecentActivitiesCard activities={recentActivities} />

              {/* Top Issue Categories Progress Bars */}
              <IssueCategoriesCard categories={issueCategories} />
            </div>
          </div>
        </div>
      </main>

      {/* Modals Suite */}
      <ViewTicketModal
        ticket={viewingTicket}
        onClose={() => setViewingTicket(null)}
        onSendReply={handleSendReply}
        onAssign={(t) => {
          setViewingTicket(null);
          setAssigningTicket(t);
        }}
        onChangeStatus={handleChangeStatus}
      />

      <ReplyTicketModal
        ticket={replyingTicket}
        onClose={() => setReplyingTicket(null)}
        onSend={handleSendReply}
      />

      <AssignTicketModal
        ticket={assigningTicket}
        onClose={() => setAssigningTicket(null)}
        onAssign={handleAssignTicket}
      />
    </div>
  );
};

export default AdminSupportPage;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { AdminNavRoute } from '../types/admin.types';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { AdminSidebar } from '../components/Sidebar/AdminSidebar';
import { AdminHeader } from '../components/Header/AdminHeader';
import { AdminStatCardsGrid } from '../components/StatCard/AdminStatCardsGrid';
import { RevenueOverviewCard } from '../components/RevenueChart/RevenueOverviewCard';
import { LivePrintActivityCard } from '../components/ActivityFeed/LivePrintActivityCard';
import { TopPerformingStoresCard } from '../components/StoreTable/TopPerformingStoresCard';
import { RecentTransactionsCard } from '../components/TransactionTable/RecentTransactionsCard';
import { PlatformAnalyticsCard } from '../components/AnalyticsCharts/PlatformAnalyticsCard';
import { SystemAlertsCard } from '../components/SystemAlerts/SystemAlertsCard';
import { RecentUsersCard } from '../components/RecentUsers/RecentUsersCard';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState<AdminNavRoute>('dashboard');

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

  const {
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    revenuePeriod,
    setRevenuePeriod,
    analyticsPeriod,
    setAnalyticsPeriod,
    isSidebarCollapsed,
    stats,
    isLoading,
    isError,
    error,
    refetch,
    revenueData,
    liveActivities,
    topStores,
    transactions,
    analytics,
    alerts,
    recentUsers
  } = useAdminDashboard();

  const errObj = error as any;
  const errorStatus = errObj?.response?.status || 'Connection Error';
  const errorMessage =
    errObj?.response?.data?.message ||
    errObj?.message ||
    'Unable to connect to MongoDB dashboard backend service.';

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-900 flex font-sans antialiased">
      {/* Left Fixed Sidebar */}
      <AdminSidebar
        activeRoute={activeRoute}
        onRouteChange={handleSidebarNav}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main Scrollable Content Canvas */}
      <main
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <div className="w-full max-w-[1680px] mx-auto p-4 sm:p-6 lg:p-7 flex flex-col gap-5">
          {/* Top Header Bar */}
          <AdminHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
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
                    Failed to load dashboard data ({errorStatus}): {errorMessage}
                  </p>
                  <p className="text-[11px] text-rose-600 font-mono mt-0.5">
                    Endpoint: /api/v1/admin/dashboard/overview
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

          {/* 12 Metric Statistics Cards Grid */}
          <AdminStatCardsGrid stats={stats} isLoading={isLoading} />

          {/* Core Analytics & Activity 3-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* COLUMN 1 (Left) */}
            <div className="flex flex-col gap-4 sm:gap-5">
              {/* Interactive SVG Revenue Curve Chart */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <RevenueOverviewCard
                  data={revenueData}
                  period={revenuePeriod}
                  onPeriodChange={setRevenuePeriod}
                  isLoading={isLoading}
                />
              </motion.div>

              {/* Recent Transactions Card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <RecentTransactionsCard
                  transactions={transactions}
                  onViewAll={() => navigate('/admin/transactions')}
                  isLoading={isLoading}
                />
              </motion.div>
            </div>

            {/* COLUMN 2 (Center) */}
            <div className="flex flex-col gap-4 sm:gap-5">
              {/* Live Print Activity Card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 }}
              >
                <LivePrintActivityCard
                  activities={liveActivities}
                  onViewAll={() => navigate('/admin/printers')}
                  isLoading={isLoading}
                />
              </motion.div>

              {/* Platform Analytics (4 Donut Charts) */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.12 }}
              >
                <PlatformAnalyticsCard
                  analytics={analytics}
                  period={analyticsPeriod}
                  onPeriodChange={setAnalyticsPeriod}
                  isLoading={isLoading}
                />
              </motion.div>
            </div>

            {/* COLUMN 3 (Right) */}
            <div className="flex flex-col gap-4 sm:gap-5">
              {/* Top Performing Stores */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.06 }}
              >
                <TopPerformingStoresCard
                  stores={topStores}
                  onViewAll={() => navigate('/admin/stores')}
                  isLoading={isLoading}
                />
              </motion.div>

              {/* System Alerts */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <SystemAlertsCard
                  alerts={alerts}
                  onViewAll={() => navigate('/admin/printers')}
                  isLoading={isLoading}
                />
              </motion.div>

              {/* Recent Users */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.14 }}
              >
                <RecentUsersCard
                  users={recentUsers}
                  onViewAll={() => navigate('/admin/users')}
                  isLoading={isLoading}
                />
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <footer className="w-full py-4 text-center text-xs text-slate-400 font-medium border-t border-slate-200/60 mt-2">
            © {new Date().getFullYear()} Self Print Platform. All rights reserved.
          </footer>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;

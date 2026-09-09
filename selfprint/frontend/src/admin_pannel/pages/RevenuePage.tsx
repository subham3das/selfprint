import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, AlertCircle, RefreshCw } from 'lucide-react';
import { AdminNavRoute } from '../types/admin.types';
import { useRevenue } from '../hooks/useRevenue';
import { AdminSidebar } from '../components/Sidebar/AdminSidebar';
import { AdminHeader } from '../components/Header/AdminHeader';
import { RevenueStatsCards } from '../components/RevenueStatsCards';
import { RevenueFilters } from '../components/RevenueFilters';
import { RevenueOverviewChart } from '../components/RevenueOverviewChart';
import { RevenueCategoryChart } from '../components/RevenueCategoryChart';
import { PaymentMethodChart } from '../components/PaymentMethodChart';
import { TopStoresTable } from '../components/TopStoresTable';
import { TopCitiesTable } from '../components/TopCitiesTable';
import { RevenueTransactionsTable } from '../components/RevenueTransactionsTable';

export const AdminRevenuePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState<AdminNavRoute>('revenue');
  const [headerSearch, setHeaderSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('Today (Live)');

  const {
    filters,
    setFilters,
    chartPeriod,
    setChartPeriod,
    stats,
    isLoading,
    isError,
    error,
    refetch,
    activeChartPoints,
    categorySegments,
    paymentSegments,
    topStores,
    topCities,
    recentTransactions,
    uniqueStores,
    uniqueCities,
    resetFilters,
    handleExport
  } = useRevenue();

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
    'Unable to connect to MongoDB revenue backend service.';

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
            title="Revenue"
            breadcrumb={[
              { label: 'Dashboard', path: '/admin/dashboard' },
              { label: 'Revenue' }
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
                    Failed to load revenue analytics ({errorStatus}): {errorMessage}
                  </p>
                  <p className="text-[11px] text-rose-600 font-mono mt-0.5">
                    Endpoint: /api/v1/admin/revenue/overview
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

          {/* 6 Top KPI Cards */}
          <RevenueStatsCards stats={stats} isLoading={isLoading} />

          {/* Filters Bar */}
          <RevenueFilters
            filters={filters}
            onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
            onReset={resetFilters}
            onExport={handleExport}
            uniqueStores={uniqueStores}
            uniqueCities={uniqueCities}
          />

          {/* Top Row: 3 Charts (Overview, Category, Payment Method) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
            {/* Large Overview Curve Chart (span 6 / 50%) */}
            <div className="lg:col-span-6">
              <RevenueOverviewChart
                points={activeChartPoints}
                period={chartPeriod}
                onPeriodChange={setChartPeriod}
                isLoading={isLoading}
              />
            </div>

            {/* Revenue by Category Donut (span 3 / 25%) */}
            <div className="lg:col-span-3">
              <RevenueCategoryChart
                segments={categorySegments}
                onViewReport={() => handleExport('report')}
                isLoading={isLoading}
              />
            </div>

            {/* Revenue by Payment Method Donut (span 3 / 25%) */}
            <div className="lg:col-span-3">
              <PaymentMethodChart
                segments={paymentSegments}
                onViewReport={() => handleExport('report')}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Bottom Row: 3 Tables (Top Stores, Top Cities, Recent Transactions) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Top Stores */}
            <div>
              <TopStoresTable stores={topStores} isLoading={isLoading} />
            </div>

            {/* Top Cities */}
            <div>
              <TopCitiesTable cities={topCities} isLoading={isLoading} />
            </div>

            {/* Recent Transactions */}
            <div>
              <RevenueTransactionsTable transactions={recentTransactions} isLoading={isLoading} />
            </div>
          </div>

          {/* Bottom Footnote & Copyright */}
          <div className="flex flex-col items-center justify-center gap-1.5 pt-4 pb-2 border-t border-slate-200/60 mt-2">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <span>All amounts are in INR (₹)</span>
              <Info className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              © {new Date().getFullYear()} Self Print Platform. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminRevenuePage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Info } from 'lucide-react';

export const AdminRevenuePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState<AdminNavRoute>('revenue');
  const [headerSearch, setHeaderSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('01 May 2025 - 29 May 2025');

  const {
    filters,
    setFilters,
    chartPeriod,
    setChartPeriod,
    stats,
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

          {/* 6 Top KPI Cards */}
          <RevenueStatsCards stats={stats} />

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
              />
            </div>

            {/* Revenue by Category Donut (span 3 / 25%) */}
            <div className="lg:col-span-3">
              <RevenueCategoryChart
                segments={categorySegments}
                onViewReport={() => handleExport('report')}
              />
            </div>

            {/* Revenue by Payment Method Donut (span 3 / 25%) */}
            <div className="lg:col-span-3">
              <PaymentMethodChart
                segments={paymentSegments}
                onViewReport={() => handleExport('report')}
              />
            </div>
          </div>

          {/* Bottom Row: 3 Tables (Top Stores, Top Cities, Recent Transactions) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Top Stores */}
            <div>
              <TopStoresTable stores={topStores} />
            </div>

            {/* Top Cities */}
            <div>
              <TopCitiesTable cities={topCities} />
            </div>

            {/* Recent Transactions */}
            <div>
              <RevenueTransactionsTable transactions={recentTransactions} />
            </div>
          </div>

          {/* Bottom Footnote & Copyright */}
          <div className="flex flex-col items-center justify-center gap-1.5 pt-4 pb-2 border-t border-slate-200/60 mt-2">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <span>All amounts are in INR (₹)</span>
              <Info className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              © 2025 Self Print Platform. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminRevenuePage;

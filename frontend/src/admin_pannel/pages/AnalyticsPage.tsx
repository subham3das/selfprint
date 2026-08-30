import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminNavRoute } from '../types/admin.types';
import { useAnalytics } from '../hooks/useAnalytics';
import { AdminSidebar } from '../components/Sidebar/AdminSidebar';
import { AdminHeader } from '../components/Header/AdminHeader';
import { AnalyticsStatsCards } from '../components/AnalyticsStatsCards';
import { PrintingActivityChart } from '../components/PrintingActivityChart';
import { PlatformHealthCard } from '../components/PlatformHealthCard';
import { PrintingHeatmap } from '../components/PrintingHeatmap';
import { AnalyticsTopStoresTable } from '../components/AnalyticsTopStoresTable';
import { PaperUsageCard } from '../components/PaperUsageCard';
import { PrintTypeChart } from '../components/PrintTypeChart';
import { PrinterStatusChart } from '../components/PrinterStatusChart';
import { RecentEventsCard } from '../components/RecentEventsCard';
import { QuickInsights } from '../components/QuickInsights';

export const AdminAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState<AdminNavRoute>('analytics');
  const [headerSearch, setHeaderSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('01 May 2025 - 29 May 2025');

  const {
    period,
    setPeriod,
    stats,
    printingActivity,
    platformHealth,
    heatmapCells,
    topStores,
    paperUsage,
    printTypeSegments,
    printerStatusSegments,
    platformEvents,
    quickInsights
  } = useAnalytics();

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
            title="Analytics"
            breadcrumb={[
              { label: 'Dashboard', path: '/admin/dashboard' },
              { label: 'Analytics' }
            ]}
            searchQuery={headerSearch}
            onSearchChange={setHeaderSearch}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* Row 1: 6 Top KPI Metrics Cards with Sparklines */}
          <AnalyticsStatsCards stats={stats} />

          {/* Row 2: 3 Major Core Visualizations (Printing Activity + Platform Health + Printing Heatmap) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Printing Activity Multi-stream Chart (5 cols) */}
            <div className="lg:col-span-5">
              <PrintingActivityChart
                data={printingActivity}
                period={period}
                onPeriodChange={setPeriod}
              />
            </div>

            {/* Platform Health Circular Progress & Breakdown (3 cols) */}
            <div className="lg:col-span-3">
              <PlatformHealthCard health={platformHealth} />
            </div>

            {/* 7x24 Printing Heatmap by Hour (4 cols) */}
            <div className="lg:col-span-4">
              <PrintingHeatmap cells={heatmapCells} />
            </div>
          </div>

          {/* Row 3: 5 Operational Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
            {/* Top 10 Stores by Performance (3 cols) */}
            <div className="lg:col-span-3">
              <AnalyticsTopStoresTable stores={topStores} />
            </div>


            {/* Most Used Paper Sizes Progress Bars (2 cols) */}
            <div className="lg:col-span-2">
              <PaperUsageCard paperStats={paperUsage} />
            </div>

            {/* Print Type Distribution Donut (2 cols) */}
            <div className="lg:col-span-2">
              <PrintTypeChart segments={printTypeSegments} />
            </div>

            {/* Printer Status Distribution Donut (2 cols) */}
            <div className="lg:col-span-2">
              <PrinterStatusChart segments={printerStatusSegments} />
            </div>

            {/* Recent Platform Events Timeline (3 cols) */}
            <div className="lg:col-span-3">
              <RecentEventsCard events={platformEvents} />
            </div>
          </div>

          {/* Row 4: Quick Insights (8 Mini Metric Cards) */}
          <QuickInsights insights={quickInsights} />
        </div>
      </main>
    </div>
  );
};

export default AdminAnalyticsPage;

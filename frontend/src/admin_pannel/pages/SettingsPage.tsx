import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminNavRoute } from '../types/admin.types';
import { useSettings } from '../hooks/useSettings';
import { AdminSidebar } from '../components/Sidebar/AdminSidebar';
import { AdminHeader } from '../components/Header/AdminHeader';
import { SettingsTabs } from '../components/SettingsTabs';
import { GeneralSettingsCard } from '../components/GeneralSettingsCard';
import { ContactInfoCard } from '../components/ContactInfoCard';
import { EmailSettingsCard } from '../components/EmailSettingsCard';
import { SystemPreferencesCard } from '../components/SystemPreferencesCard';
import { SessionSettingsCard } from '../components/SessionSettingsCard';
import { SystemOverviewCard } from '../components/SystemOverviewCard';
import { SettingsIntegrationsCard } from '../components/SettingsIntegrationsCard';
import { DangerZoneCard } from '../components/DangerZoneCard';

export const AdminSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState<AdminNavRoute>('settings');
  const [headerSearch, setHeaderSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('01 May 2025 - 29 May 2025');

  const {
    activeTab,
    setActiveTab,
    settings,
    toastMessage,
    handleSaveGeneral,
    handleSaveContact,
    handleSaveEmail,
    handleSaveSystemPreferences,
    handleSaveSession,
    handleClearCache,
    handleResetSettings,
    handleDeleteData
  } = useSettings();

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
            title="Settings"
            breadcrumb={[
              { label: 'Dashboard', path: '/admin/dashboard' },
              { label: 'Settings' }
            ]}
            searchQuery={headerSearch}
            onSearchChange={setHeaderSearch}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {/* Top Horizontal Navigation Tabs */}
          <SettingsTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Main 2-Column Grid: Left/Center Form Cards (8 cols), Right Overview & Integrations (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left & Middle Column (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              {/* Top Row: General Settings & Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                <GeneralSettingsCard
                  initialValues={settings.general}
                  onSave={handleSaveGeneral}
                />
                <ContactInfoCard
                  initialValues={settings.contact}
                  onSave={handleSaveContact}
                />
              </div>

              {/* Bottom Row: Email Settings, System Preferences & Session Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                <EmailSettingsCard
                  initialValues={settings.email}
                  onSave={handleSaveEmail}
                />
                <SystemPreferencesCard
                  initialValues={settings.systemPreferences}
                  onSave={handleSaveSystemPreferences}
                />
                <SessionSettingsCard
                  initialValues={settings.session}
                  onSave={handleSaveSession}
                />
              </div>
            </div>

            {/* Right Column: System Overview, Integrations & Danger Zone (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <SystemOverviewCard overview={settings.systemOverview} />
              <SettingsIntegrationsCard
                integrations={settings.integrations}
                onManage={() => setActiveTab('Integrations')}
              />
              <DangerZoneCard
                onClearCache={handleClearCache}
                onResetSettings={handleResetSettings}
                onDeleteData={handleDeleteData}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 pb-2 text-center text-xs text-slate-400 font-medium">
            <p>© 2025 Self Print Platform. All rights reserved.</p>
          </div>
        </div>
      </main>

      {/* Save Success Toast */}
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

export default AdminSettingsPage;

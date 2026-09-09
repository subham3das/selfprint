import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
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

import { usePermission } from '../context/PermissionContext';
import { Lock } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermission();
  const canManage = can('settings', 'manage');

  const [activeRoute, setActiveRoute] = useState<AdminNavRoute>('settings');
  const [headerSearch, setHeaderSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('Today (Live)');

  const {
    activeTab,
    setActiveTab,
    settings,
    isLoading,
    isSaving,
    isError,
    error,
    toastMessage,
    refetch,
    handleSaveGeneral,
    handleSaveContact,
    handleSaveEmail,
    handleSaveSystemPreferences,
    handleSaveSession,
    handleTestIntegration,
    handleTestEmail,
    handleTriggerBackup,
    handleClearCache,
    handleResetSettings,
    handleDeleteData
  } = useSettings();


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
    'Unable to connect to MongoDB platform settings engine.';

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
            title="Platform Settings"
            breadcrumb={[
              { label: 'Dashboard', path: '/admin/dashboard' },
              { label: 'Settings' }
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
                    Failed to fetch settings ({errorStatus}): {errorMessage}
                  </p>
                  <p className="text-[11px] text-rose-600 font-mono mt-0.5">
                    Endpoint: /api/v1/admin/settings
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

          {/* Read-Only Access Notice Banner */}
          {!canManage && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-center gap-3 text-xs font-medium shadow-2xs">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Read-Only Mode:</strong> You have view permissions for Platform Settings. You do not have 'manage' permissions to modify system configurations.
              </span>
            </div>
          )}

          {/* Top Horizontal Navigation Tabs */}
          <SettingsTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />


          {/* Main 2-Column Grid: Left/Center Form Cards (8 cols), Right Overview & Integrations (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left/Center Main Form Area (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              {isLoading ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-pulse h-96 flex flex-col gap-4">
                  <div className="w-36 h-4 bg-slate-200 rounded" />
                  <div className="w-64 h-3 bg-slate-100 rounded" />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="h-10 bg-slate-100 rounded-xl" />
                    <div className="h-10 bg-slate-100 rounded-xl" />
                  </div>
                  <div className="h-24 bg-slate-100 rounded-xl mt-2" />
                </div>
              ) : (
                <>
                  {/* General Tab */}
                  {activeTab === 'General' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <GeneralSettingsCard
                        initialValues={settings.general}
                        onSave={handleSaveGeneral}
                        isSaving={isSaving}
                      />
                      <ContactInfoCard
                        initialValues={settings.contact}
                        onSave={handleSaveContact}
                        isSaving={isSaving}
                      />
                    </div>
                  )}

                  {/* Platform Tab */}
                  {activeTab === 'Platform' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <SystemPreferencesCard
                        initialValues={settings.systemPreferences}
                        onSave={handleSaveSystemPreferences}
                        isSaving={isSaving}
                      />
                      <SessionSettingsCard
                        initialValues={settings.session}
                        onSave={handleSaveSession}
                        isSaving={isSaving}
                      />
                    </div>
                  )}

                  {/* Notifications Tab */}
                  {activeTab === 'Notifications' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <EmailSettingsCard
                        initialValues={settings.email}
                        onSave={handleSaveEmail}
                        onTestEmail={handleTestEmail}
                        isSaving={isSaving}
                      />
                      <SystemPreferencesCard
                        initialValues={settings.systemPreferences}
                        onSave={handleSaveSystemPreferences}
                        isSaving={isSaving}
                      />
                    </div>
                  )}

                  {/* Security Tab */}
                  {activeTab === 'Security' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <SessionSettingsCard
                        initialValues={settings.session}
                        onSave={handleSaveSession}
                        isSaving={isSaving}
                      />
                      <DangerZoneCard
                        onClearCache={handleClearCache}
                        onResetSettings={handleResetSettings}
                        onDeleteData={handleDeleteData}
                      />
                    </div>
                  )}

                  {/* Stores / Printing / Billing / Integrations / System fallback tabs */}
                  {(activeTab === 'Stores' ||
                    activeTab === 'Users' ||
                    activeTab === 'Printing' ||
                    activeTab === 'Billing' ||
                    activeTab === 'Integrations' ||
                    activeTab === 'System') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <GeneralSettingsCard
                        initialValues={settings.general}
                        onSave={handleSaveGeneral}
                        isSaving={isSaving}
                      />
                      <SystemPreferencesCard
                        initialValues={settings.systemPreferences}
                        onSave={handleSaveSystemPreferences}
                        isSaving={isSaving}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Aside Sidebar: System Overview & Integrations (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <SystemOverviewCard
                overview={settings.systemOverview}
                onTriggerBackup={handleTriggerBackup}
              />

              <SettingsIntegrationsCard
                integrations={settings.integrations}
                onManage={() => setActiveTab('Integrations')}
                onTestIntegration={handleTestIntegration}
              />

              <DangerZoneCard
                onClearCache={handleClearCache}
                onResetSettings={handleResetSettings}
                onDeleteData={handleDeleteData}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Floating Toast Notification */}
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

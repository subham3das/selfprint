import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/layout/ToastContainer';
import { DashboardPage } from './pages/DashboardPage';
import { PrintersPage } from './pages/PrintersPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ActivityPage } from './pages/ActivityPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { initDesktopSocket } from './services/socket';
import { localApi } from './services/api';
import { BACKEND_URL } from './config/api';
import { NavigationTab } from './types';

/**
 * Shared QueryClient for the entire application.
 * Exported so that socket.ts can call invalidateQueries / removeQueries
 * without importing React hooks.
 *
 * staleTime: 8s — prevents double-fetch on mount immediately after reconnect
 * refetchOnWindowFocus: false — Electron focus events should not trigger fetches
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 8_000
    }
  }
});

export const AppContent: React.FC = () => {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const theme = useAppStore((s) => s.theme);
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    // Apply theme class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    // Pass queryClient into socket so it can invalidate/clear caches on events
    initDesktopSocket(queryClient, BACKEND_URL);

    // ── Tray / IPC action handlers ────────────────────────────────────────
    if ((window as any).electronAPI) {
      (window as any).electronAPI.onNavigate((tab: string) => {
        setActiveTab(tab as NavigationTab);
      });

      (window as any).electronAPI.onTriggerAction(async (action: string) => {
        if (action === 'reconnect') {
          // Always re-check health first, then printers will follow automatically
          queryClient.invalidateQueries({ queryKey: ['health'] });
          showToast('Reconnecting', 'Checking Host Service on localhost:4500...', 'info');

        } else if (action === 'refresh_printers') {
          // HEALTH-GATED: check host before requesting printers
          try {
            await localApi.getHealth();
            // Health passed — re-fetch printers from Host Service
            queryClient.invalidateQueries({ queryKey: ['health'] });
            queryClient.invalidateQueries({ queryKey: ['printers'] });
            showToast('Refreshing', 'Host Service online — scanning for printers...', 'info');
          } catch {
            // Host offline — do not fetch printers, show error
            showToast(
              'Host Service Offline',
              'Cannot refresh printers: localhost:4500 is unreachable.',
              'error'
            );
          }

        } else if (action === 'restart') {
          showToast('Restart', 'Connector restart requested.', 'warning');
        }
      });
    }
  }, [setActiveTab, theme, showToast]);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':    return <DashboardPage />;
      case 'printers':     return <PrintersPage />;
      case 'notifications': return <NotificationsPage />;
      case 'activity':     return <ActivityPage />;
      case 'settings':     return <SettingsPage />;
      case 'about':        return <AboutPage />;
      default:             return <DashboardPage />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Native Windows Title Bar */}
      <TitleBar />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950/60">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderActivePage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

export default App;

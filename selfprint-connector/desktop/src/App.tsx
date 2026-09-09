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
import { NavigationTab } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5000
    }
  }
});

export const AppContent: React.FC = () => {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const theme = useAppStore((s) => s.theme);
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    // Initialize Socket bridge
    initDesktopSocket();

    // Electron IPC Event Handlers
    if ((window as any).electronAPI) {
      (window as any).electronAPI.onNavigate((tab: string) => {
        setActiveTab(tab as NavigationTab);
      });

      (window as any).electronAPI.onTriggerAction((action: string) => {
        if (action === 'reconnect') {
          queryClient.invalidateQueries({ queryKey: ['health'] });
          showToast('Reconnecting', 'Reconnecting cloud bridge...', 'info');
        } else if (action === 'refresh_printers') {
          queryClient.invalidateQueries({ queryKey: ['printers'] });
          showToast('Refreshing', 'Scanning for local printers...', 'info');
        } else if (action === 'restart') {
          showToast('Restart', 'Connector restart requested.', 'warning');
        }
      });
    }
  }, [setActiveTab, theme, showToast]);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'printers':
        return <PrintersPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'activity':
        return <ActivityPage />;
      case 'settings':
        return <SettingsPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <DashboardPage />;
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

        {/* Dynamic Page Content with Framer Motion */}
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

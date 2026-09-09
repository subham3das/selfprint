import { create } from 'zustand';
import { NavigationTab, AppNotification, ActivityEvent, NotificationSeverity } from '../types';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
}

interface AppState {
  activeTab: NavigationTab;
  theme: 'dark' | 'light';
  notifications: AppNotification[];
  activities: ActivityEvent[];
  toasts: ToastItem[];
  isLocalConnected: boolean;
  isBackendConnected: boolean;

  // Actions
  setActiveTab: (tab: NavigationTab) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
  addActivity: (activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  showToast: (title: string, message: string, severity?: NotificationSeverity) => void;
  removeToast: (id: string) => void;
  setConnectionStatus: (local: boolean, backend?: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'dashboard',
  theme: (localStorage.getItem('selfprint_theme') as 'dark' | 'light') || 'dark',
  notifications: [
    {
      id: 'n_initial_1',
      title: 'Connector Initialized',
      message: 'SelfPrint Hardware Bridge started successfully in background.',
      severity: 'success',
      timestamp: new Date().toISOString(),
      read: false,
      source: 'CONNECTOR'
    }
  ],
  activities: [
    {
      id: 'act_1',
      type: 'CONNECTOR_STARTED',
      title: 'Bridge Daemon Bootstrapped',
      description: 'Local printer detection and hardware synchronization started.',
      timestamp: new Date().toISOString()
    }
  ],
  toasts: [],
  isLocalConnected: false,
  isBackendConnected: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setTheme: (theme) => {
    localStorage.setItem('selfprint_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  addNotification: (notif) => {
    const newEntry: AppNotification = {
      ...notif,
      id: `n_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    set((state) => ({
      notifications: [newEntry, ...state.notifications]
    }));

    // Trigger toast & Native Windows notification
    get().showToast(notif.title, notif.message, notif.severity);
    if ((window as any).electronAPI?.showNotification) {
      (window as any).electronAPI.showNotification(notif.title, notif.message);
    }
  },

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true }))
    })),

  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),

  clearNotifications: () => set({ notifications: [] }),

  addActivity: (activity) => {
    const newAct: ActivityEvent = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    set((state) => ({
      activities: [newAct, ...state.activities.slice(0, 199)] // Keep latest 200
    }));
  },

  showToast: (title, message, severity = 'info') => {
    const id = `t_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, title, message, severity }]
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4500);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    })),

  setConnectionStatus: (local, backend) =>
    set((state) => ({
      isLocalConnected: local,
      isBackendConnected: backend !== undefined ? backend : state.isBackendConnected
    }))
}));

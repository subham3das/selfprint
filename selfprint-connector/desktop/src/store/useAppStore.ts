import { create } from 'zustand';
import { NavigationTab, AppNotification, ActivityEvent, NotificationSeverity } from '../types';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
}

import { ConnectionState } from '../types/connectionState';
import { UpdateStatusPayload } from '../types/updater';
import { StoreAccount, StoreAuthSession, AuthStage } from '../types/auth';
import { storeAuthService, emitLifecycleLog } from '../services/storeAuth';
export type { ConnectionState };
export type RealtimeConnectionState = ConnectionState;

interface AppState {
  activeTab: NavigationTab;
  theme: 'dark' | 'light';
  notifications: AppNotification[];
  activities: ActivityEvent[];
  toasts: ToastItem[];
  isLocalConnected: boolean;
  isBackendConnected: boolean;
  /** Standardized connection state across Web and Desktop */
  connectionState: RealtimeConnectionState;
  /** True while the WebSocket is actively trying to reconnect after a drop */
  isSocketReconnecting: boolean;
  /** Live automatic update status */
  updateStatus: UpdateStatusPayload;
  isUpdateModalOpen: boolean;

  // Authentication & Store Selection State
  authStage: AuthStage;
  authSession: StoreAuthSession | null;
  userStores: StoreAccount[];
  selectedStore: StoreAccount | null;

  // Actions
  setActiveTab: (tab: NavigationTab) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setAuthStage: (stage: AuthStage) => void;
  setAuthSession: (session: StoreAuthSession | null) => void;
  setUserStores: (stores: StoreAccount[]) => void;
  setSelectedStore: (store: StoreAccount | null) => void;
  logout: () => Promise<void>;
  switchStore: () => Promise<void>;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
  addActivity: (activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  showToast: (title: string, message: string, severity?: NotificationSeverity) => void;
  removeToast: (id: string) => void;
  setConnectionStatus: (local?: boolean, backend?: boolean) => void;
  setLocalConnected: (local: boolean) => void;
  setBackendConnected: (backend: boolean) => void;
  setConnectionState: (state: RealtimeConnectionState) => void;
  setSocketReconnecting: (reconnecting: boolean) => void;
  setUpdateStatus: (status: UpdateStatusPayload) => void;
  setUpdateModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'dashboard',
  theme: (localStorage.getItem('selfprint_theme') as 'dark' | 'light') || 'dark',
  updateStatus: {
    state: 'IDLE',
    currentVersion: '1.0.0'
  },
  isUpdateModalOpen: false,
  setUpdateStatus: (status) => {
    set({
      updateStatus: status,
      // Open modal automatically when download is complete
      ...(status.state === 'DOWNLOADED' ? { isUpdateModalOpen: true } : {})
    });
  },
  setUpdateModalOpen: (open) => set({ isUpdateModalOpen: open }),
  notifications: [
    {
      id: 'n_initial_1',
      title: 'Desktop UI Started',
      message: 'Waiting for SelfPrint Host Service on localhost:4500...',
      severity: 'info',
      timestamp: new Date().toISOString(),
      read: false,
      source: 'CONNECTOR'
    }
  ],
  activities: [
    {
      id: 'act_1',
      type: 'CONNECTOR_STARTED',
      title: 'Desktop UI Launched',
      description: 'Connecting to SelfPrint Host Service at localhost:4500. Printers will appear once the service responds.',
      timestamp: new Date().toISOString()
    }
  ],
  toasts: [],
  isLocalConnected: false,
  isBackendConnected: false,
  connectionState: 'OFFLINE',
  isSocketReconnecting: false,

  // Auth defaults
  authStage: 'CHECKING_AUTH',
  authSession: null,
  userStores: [],
  selectedStore: null,

  setAuthStage: (stage) => set({ authStage: stage }),
  setAuthSession: (session) => set({ authSession: session }),
  setUserStores: (stores) => set({ userStores: stores }),
  setSelectedStore: (store) => {
    if (store) {
      emitLifecycleLog('Store Selected', `Selected Store: ${store.storeName} (${store.storeCode || store.id})`);
    }
    set({ selectedStore: store });
  },

  logout: async () => {
    await storeAuthService.clearAuthSession();
    set({
      authSession: null,
      selectedStore: null,
      authStage: 'LOGIN'
    });
    get().showToast('Logged Out', 'You have been signed out.', 'info');
  },

  switchStore: async () => {
    const { selectedStore, userStores } = get();
    const storeId = selectedStore?.id;
    try {
      await storeAuthService.unpairConnector({ storeId });
    } catch {}

    set({
      selectedStore: null,
      authStage: userStores.length > 1 ? 'STORE_SELECTION' : 'PAIRING'
    });
    get().showToast('Switched Store', 'Connector unpaired. Select another store to connect.', 'info');
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setTheme: (theme) => {
    localStorage.setItem('selfprint_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  addNotification: (notif) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `n_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications.slice(0, 99)] // Keep latest 100
    }));

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

  setConnectionStatus: (local?: boolean, backend?: boolean) =>
    set((state) => {
      const isLocal = local !== undefined ? local : state.isLocalConnected;
      const isBackend = backend !== undefined ? backend : state.isBackendConnected;
      let nextState: ConnectionState = 'OFFLINE';
      if (!isLocal) {
        nextState = 'OFFLINE';
      } else {
        nextState = 'HOST_RUNNING';
      }
      return {
        isLocalConnected: isLocal,
        isBackendConnected: isBackend,
        connectionState: nextState
      };
    }),

  setLocalConnected: (local: boolean) =>
    set((state) => ({
      isLocalConnected: local,
      connectionState: !local ? 'OFFLINE' : 'HOST_RUNNING'
    })),

  setBackendConnected: (backend: boolean) =>
    set((state) => ({
      isBackendConnected: backend
    })),

  setConnectionState: (connectionState) => set({ connectionState }),

  setSocketReconnecting: (reconnecting) =>
    set((state) => ({
      isSocketReconnecting: reconnecting,
      connectionState: reconnecting ? 'RECONNECTING' : state.connectionState
    }))
}));

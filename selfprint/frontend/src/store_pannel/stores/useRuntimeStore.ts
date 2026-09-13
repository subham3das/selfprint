import { useSyncExternalStore } from 'react';
import { getSocket } from '@/lib/socket';
import api from '@/lib/axios';

export interface RuntimePrinter {
  id: string;
  name: string;
  model?: string;
  brand?: string;
  status: string;
  isOnline: boolean;
  isDefault?: boolean;
  isVirtual?: boolean;
  connectionType?: string;
  paperLevel?: number;
  tonerLevel?: number;
  capabilities?: any;
}

export interface StoreRuntimeState {
  storeId: string | null;
  connected: boolean;
  connectorId?: string;
  connectorVersion?: string;
  heartbeat: Date | null;
  printerState: 'READY' | 'OFFLINE';
  printerCount: number;
  printers: RuntimePrinter[];
  activePrinter: string;
  activePrinterDetails: RuntimePrinter | null;
  testMode: boolean;
  hardwareStatus: string;
  printingJob?: string;
  lastUpdated: string;
  isHydrated: boolean;
}

let runtimeState: StoreRuntimeState = {
  storeId: null,
  connected: false,
  connectorId: undefined,
  connectorVersion: '1.0.0',
  heartbeat: null,
  printerState: 'OFFLINE',
  printerCount: 0,
  printers: [],
  activePrinter: '',
  activePrinterDetails: null,
  testMode: false,
  hardwareStatus: 'Desktop Connector Offline',
  printingJob: undefined,
  lastUpdated: new Date().toISOString(),
  isHydrated: false
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function updateRuntimeState(partial: Partial<StoreRuntimeState>) {
  runtimeState = { ...runtimeState, ...partial };
  emitChange();
}

let isSubscribed = false;
let currentStoreId: string | null = null;

export const runtimeActions = {
  getState: () => runtimeState,

  fetchInitial: async (storeId: string) => {
    if (!storeId) return;
    try {
      const res = await api.get(`/api/v1/connector/status/${storeId}`);
      if (res.data && res.data.success && res.data.data) {
        const d = res.data.data;
        updateRuntimeState({
          storeId,
          connected: Boolean(d.connectorConnected ?? d.isOnline),
          connectorId: d.connectorId,
          connectorVersion: d.connectorVersion || '1.0.0',
          heartbeat: d.connectorHeartbeat ? new Date(d.connectorHeartbeat) : null,
          printerState: d.printerState || (d.connectorConnected || d.isOnline ? 'READY' : 'OFFLINE'),
          printerCount: d.printerCount ?? d.physicalPrinterCount ?? 0,
          printers: d.printers || d.physicalPrinters || [],
          activePrinter: d.activePrinter || '',
          activePrinterDetails: d.activePrinterDetails || (d.printers && d.printers.length > 0 ? d.printers[0] : null),
          testMode: Boolean(d.testMode),
          hardwareStatus: d.hardwareStatus || (d.connectorConnected ? 'Online' : 'Desktop Connector Offline'),
          printingJob: d.printingJob,
          lastUpdated: d.lastUpdated || new Date().toISOString(),
          isHydrated: true
        });
      }
    } catch {
      updateRuntimeState({ storeId, isHydrated: true });
    }
  },

  subscribeToStore: (storeId: string) => {
    if (!storeId) return;
    if (isSubscribed && currentStoreId === storeId) return;

    currentStoreId = storeId;
    isSubscribed = true;
    updateRuntimeState({ storeId });

    runtimeActions.fetchInitial(storeId);

    const socket = getSocket();
    if (!socket) return;

    socket.emit('join_store', storeId);

    socket.on('runtime_updated', (runtime: any) => {
      if (!runtime) return;
      if (runtime.storeId && runtime.storeId !== storeId) return;

      updateRuntimeState({
        connected: Boolean(runtime.connectorConnected),
        connectorId: runtime.connectorId,
        connectorVersion: runtime.connectorVersion || '1.0.0',
        heartbeat: runtime.connectorHeartbeat ? new Date(runtime.connectorHeartbeat) : new Date(),
        printerState: runtime.printerState || (runtime.connectorConnected ? 'READY' : 'OFFLINE'),
        printerCount: runtime.printerCount || 0,
        printers: runtime.printers || [],
        activePrinter: runtime.activePrinter || '',
        activePrinterDetails: runtime.activePrinterDetails || null,
        testMode: Boolean(runtime.testMode),
        hardwareStatus: runtime.hardwareStatus || (runtime.connectorConnected ? 'Online' : 'Desktop Connector Offline'),
        printingJob: runtime.printingJob,
        lastUpdated: runtime.lastUpdated || new Date().toISOString(),
        isHydrated: true
      });
    });

    const handleTestMode = (data: { testMode?: boolean; enabled?: boolean; storeId?: string }) => {
      if (data && (data.storeId === undefined || data.storeId === storeId)) {
        updateRuntimeState({ testMode: Boolean(data.testMode ?? data.enabled) });
      }
    };
    socket.on('store:testModeChanged', handleTestMode);
    socket.on('test_mode_changed', handleTestMode);
  }
};

export function useRuntimeStore<T = StoreRuntimeState>(selector?: (state: StoreRuntimeState) => T): T {
  const snapshot = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => runtimeState,
    () => runtimeState
  );

  return selector ? selector(snapshot) : (snapshot as unknown as T);
}

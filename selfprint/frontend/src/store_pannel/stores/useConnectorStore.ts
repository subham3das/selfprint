import { useSyncExternalStore } from 'react';
import { printerService } from '../services/printer.service';

export type ConnectorWizardState =
  | 'NOT_INSTALLED'
  | 'INSTALLED_NOT_RUNNING'
  | 'RUNNING_UNPAIRED'
  | 'PAIRING'
  | 'AUTHENTICATING'
  | 'CONNECTED'
  | 'SCANNING_PRINTERS'
  | 'READY';

export interface ConnectorStoreData {
  // Core Connector Telemetry State
  paired: boolean;
  isOnline: boolean;
  status: 'ONLINE' | 'OFFLINE';
  state: ConnectorWizardState | string;
  storeName: string | null;
  hostname: string | null;
  machineId?: string;
  socketConnected: boolean;
  authenticated: boolean;
  hostRunning: boolean;
  physicalPrinters: any[];
  physicalPrinterCount: number;
  lastHeartbeat: string | null;
  lastHeartbeatTimestamp: number | null;
  diffSeconds: number;

  // Hydration & Status Loading
  isHydrated: boolean;
  isCheckingStatus: boolean;
  lastSyncError: string | null;

  // Pairing Code State
  pairingCode: string | null;
  pairingExpiresInSeconds: number;
  isGeneratingCode: boolean;
  codeError: string | null;
}

const HEARTBEAT_TIMEOUT_MS = 30_000; // 30 seconds watchdog

let state: ConnectorStoreData = {
  paired: false,
  isOnline: false,
  status: 'OFFLINE',
  state: 'NOT_PAIRED',
  storeName: null,
  hostname: null,
  machineId: undefined,
  socketConnected: false,
  authenticated: false,
  hostRunning: false,
  physicalPrinters: [],
  physicalPrinterCount: 0,
  lastHeartbeat: null,
  lastHeartbeatTimestamp: null,
  diffSeconds: 999,

  isHydrated: false,
  isCheckingStatus: false,
  lastSyncError: null,

  pairingCode: null,
  pairingExpiresInSeconds: 600,
  isGeneratingCode: false,
  codeError: null
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function updateState(updater: Partial<ConnectorStoreData> | ((prev: ConnectorStoreData) => Partial<ConnectorStoreData>)) {
  const next = typeof updater === 'function' ? updater(state) : updater;
  state = { ...state, ...next };
  emitChange();
}

export const connectorStoreActions = {
  getState: () => state,

  /**
   * Initial page load or reconnection recovery REST sync
   */
  hydrate: async (storeId?: string, force = false) => {
    if (state.isHydrated && !force && state.isCheckingStatus) return;

    updateState({ isCheckingStatus: true, lastSyncError: null });
    try {
      const res = await printerService.getConnectorStatus(storeId);
      const raw = res.connector;
      const hbTime = res.lastHeartbeat ? new Date(res.lastHeartbeat).getTime() : null;
      const diffMs = hbTime ? Math.max(0, Date.now() - hbTime) : 999999;
      const diffSec = Math.round(diffMs / 1000);

      const isReallyOnline = Boolean(
        res.isOnline ||
        (res.paired && hbTime && diffMs < HEARTBEAT_TIMEOUT_MS)
      );

      const rawPrinters = Array.isArray(res.physicalPrinters) ? res.physicalPrinters : [];
      const count = typeof res.physicalPrinterCount === 'number' ? res.physicalPrinterCount : rawPrinters.length;

      let determinedState: ConnectorWizardState | string = 'RUNNING_UNPAIRED';
      if (res.paired && isReallyOnline) {
        determinedState = count > 0 ? 'READY' : 'CONNECTED';
      } else if (res.paired && !isReallyOnline) {
        determinedState = 'INSTALLED_NOT_RUNNING';
      }

      updateState({
        paired: res.paired,
        isOnline: isReallyOnline,
        status: isReallyOnline ? 'ONLINE' : 'OFFLINE',
        state: determinedState,
        storeName: raw?.storeName || null,
        hostname: raw?.hostname || res.machineName || null,
        machineId: raw?.machineId,
        socketConnected: res.socketConnected || isReallyOnline,
        authenticated: res.authenticated || isReallyOnline,
        hostRunning: Boolean(raw?.hostRunning ?? isReallyOnline),
        physicalPrinters: rawPrinters,
        physicalPrinterCount: count,
        lastHeartbeat: res.lastHeartbeat || null,
        lastHeartbeatTimestamp: hbTime,
        diffSeconds: diffSec,
        isHydrated: true,
        isCheckingStatus: false
      });
    } catch (err: any) {
      console.warn('[useConnectorStore] Hydration failed:', err);
      updateState({
        isCheckingStatus: false,
        lastSyncError: err?.message || 'Failed to sync connector status'
      });
    }
  },

  /**
   * Explicit manual user refresh
   */
  manualRefresh: async (storeId?: string) => {
    return connectorStoreActions.hydrate(storeId, true);
  },

  /**
   * Generates a 10-minute pairing code
   */
  generatePairingCode: async (storeId?: string) => {
    updateState({ isGeneratingCode: true, codeError: null });
    try {
      const res = await printerService.generatePairingCode(storeId);
      const code = res.code || res.pairingCode;
      const seconds = res.expiresInSeconds || 600;

      updateState({
        pairingCode: code,
        pairingExpiresInSeconds: seconds,
        state: 'PAIRING',
        isGeneratingCode: false
      });
      return code;
    } catch (err: any) {
      updateState({
        isGeneratingCode: false,
        codeError: err?.message || 'Failed to generate code'
      });
      return null;
    }
  },

  /**
   * Unpairs the connector and wipes state
   */
  unpairConnector: async (storeId?: string) => {
    try {
      await printerService.unpairConnector(storeId);
      connectorStoreActions.handleSocketUnpaired();
      return true;
    } catch (err) {
      console.error('[useConnectorStore] Unpair failed:', err);
      return false;
    }
  },

  setPairingCode: (code: string | null, seconds = 600) => {
    updateState({
      pairingCode: code,
      pairingExpiresInSeconds: seconds,
      state: code ? 'PAIRING' : (state.paired ? (state.isOnline ? 'CONNECTED' : 'INSTALLED_NOT_RUNNING') : 'RUNNING_UNPAIRED')
    });
  },

  decrementCountdown: () => {
    const current = state.pairingExpiresInSeconds;
    if (current <= 1) {
      updateState({ pairingExpiresInSeconds: 0, pairingCode: null });
    } else {
      updateState({ pairingExpiresInSeconds: current - 1 });
    }
  },

  /**
   * Pure WebSocket In-Memory Mutator: connector:heartbeat
   * Optimistically updates heartbeat timestamp and marks online with zero REST calls.
   */
  handleSocketHeartbeat: (payload: any) => {
    const now = Date.now();
    const printers = Array.isArray(payload?.printers)
      ? payload.printers
      : (Array.isArray(payload?.physicalPrinters) ? payload.physicalPrinters : null);

    updateState((prev) => {
      const updatedPrinters = printers !== null ? printers : prev.physicalPrinters;
      const count = printers !== null
        ? (typeof payload?.printerCount === 'number' ? payload.printerCount : printers.length)
        : prev.physicalPrinterCount;

      const nextState = count > 0 ? 'READY' : 'CONNECTED';

      return {
        paired: true,
        isOnline: true,
        status: 'ONLINE',
        state: prev.state === 'PAIRING' ? 'PAIRING' : nextState,
        hostname: payload?.hostname || payload?.machineName || prev.hostname,
        socketConnected: true,
        authenticated: true,
        hostRunning: true,
        physicalPrinters: updatedPrinters,
        physicalPrinterCount: count,
        lastHeartbeat: payload?.timestamp || payload?.lastHeartbeat || new Date(now).toISOString(),
        lastHeartbeatTimestamp: now,
        diffSeconds: 0
      };
    });
  },

  /**
   * Pure WebSocket In-Memory Mutator: connector:connected
   */
  handleSocketConnected: (payload: any) => {
    const now = Date.now();
    updateState((prev) => ({
      paired: true,
      isOnline: true,
      status: 'ONLINE',
      state: prev.physicalPrinterCount > 0 ? 'READY' : 'CONNECTED',
      hostname: payload?.hostname || prev.hostname,
      socketConnected: true,
      authenticated: true,
      hostRunning: true,
      lastHeartbeatTimestamp: now,
      diffSeconds: 0
    }));
  },

  /**
   * Pure WebSocket In-Memory Mutator: connector:disconnected
   */
  handleSocketDisconnected: (_payload: any) => {
    updateState((prev) => ({
      isOnline: false,
      status: 'OFFLINE',
      socketConnected: false,
      hostRunning: false,
      state: prev.paired ? 'INSTALLED_NOT_RUNNING' : 'RUNNING_UNPAIRED'
    }));
  },

  /**
   * Pure WebSocket In-Memory Mutator: connector:paired
   */
  handleSocketPaired: (payload: any) => {
    const now = Date.now();
    updateState({
      paired: true,
      isOnline: true,
      status: 'ONLINE',
      state: 'CONNECTED',
      pairingCode: null,
      hostname: payload?.hostname || null,
      socketConnected: true,
      authenticated: true,
      hostRunning: true,
      lastHeartbeatTimestamp: now,
      diffSeconds: 0
    });
  },

  /**
   * Pure WebSocket In-Memory Mutator: connector:unpaired
   */
  handleSocketUnpaired: () => {
    updateState({
      paired: false,
      isOnline: false,
      status: 'OFFLINE',
      state: 'RUNNING_UNPAIRED',
      hostname: null,
      machineId: undefined,
      socketConnected: false,
      authenticated: false,
      hostRunning: false,
      physicalPrinters: [],
      physicalPrinterCount: 0,
      pairingCode: null,
      lastHeartbeat: null,
      lastHeartbeatTimestamp: null,
      diffSeconds: 999
    });
  },

  /**
   * Pure WebSocket In-Memory Mutator: printer:updated
   */
  handlePrintersUpdated: (printers: any[]) => {
    const count = printers.length;
    updateState((prev) => ({
      physicalPrinters: printers,
      physicalPrinterCount: count,
      state: prev.isOnline ? (count > 0 ? 'READY' : 'CONNECTED') : prev.state
    }));
  },

  /**
   * Heartbeat Watchdog: Runs every 5s.
   * If isOnline is true but lastHeartbeatTimestamp is > 30s old, marks OFFLINE.
   */
  checkHeartbeatTimeout: () => {
    const { isOnline, lastHeartbeatTimestamp, paired } = state;
    if (!lastHeartbeatTimestamp) return;

    const diffMs = Date.now() - lastHeartbeatTimestamp;
    const diffSec = Math.round(diffMs / 1000);

    if (isOnline && diffMs > HEARTBEAT_TIMEOUT_MS) {
      console.warn(`[useConnectorStore] Heartbeat silence watchdog timeout (${diffSec}s > 30s). Marking OFFLINE.`);
      updateState({
        isOnline: false,
        status: 'OFFLINE',
        state: paired ? 'INSTALLED_NOT_RUNNING' : 'NOT_PAIRED',
        diffSeconds: diffSec
      });
    } else {
      updateState({ diffSeconds: diffSec });
    }
  }
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useConnectorStore() {
  const storeData = useSyncExternalStore(
    subscribe,
    () => state,
    () => state
  );

  return {
    ...storeData,
    ...connectorStoreActions
  };
}

// Global Static Accessors
useConnectorStore.getState = () => ({
  ...state,
  ...connectorStoreActions
});
useConnectorStore.actions = connectorStoreActions;

// Global Watchdog Singleton
let watchdogInterval: NodeJS.Timeout | null = null;
if (typeof window !== 'undefined' && !watchdogInterval) {
  watchdogInterval = setInterval(() => {
    connectorStoreActions.checkHeartbeatTimeout();
  }, 5000);
}

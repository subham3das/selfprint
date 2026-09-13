import { useSyncExternalStore } from 'react';
import { printerService } from '../services/printer.service';
import { getSocket } from '@/lib/socket';
import { storeAuthService } from '../services/storeAuth.service';

export type ConnectorWizardState =
  | 'UNKNOWN'
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
  testMode: boolean;
  paired: boolean;
  isOnline: boolean;
  status: 'ONLINE' | 'OFFLINE' | 'UNKNOWN';
  state: ConnectorWizardState | string;
  connectorId: string | null;
  storeId: string | null;
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
  testMode: false,
  paired: false,
  isOnline: false,
  status: 'UNKNOWN',
  state: 'UNKNOWN',
  connectorId: null,
  storeId: null,
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
  diffSeconds: 0,

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

/**
 * Validates whether an incoming socket payload belongs to the active Store / Connector
 */
function isPayloadRelevant(payload: any): boolean {
  const activeStoreId = state.storeId || storeAuthService.getStoreId() || localStorage.getItem('selfprint_store_id');
  if (payload?.storeId && activeStoreId && payload.storeId !== activeStoreId && payload.storeId !== 'default') {
    return false;
  }
  if (state.connectorId && payload?.connectorId && payload.connectorId !== state.connectorId) {
    return false;
  }
  return true;
}

export const connectorStoreActions = {
  getState: () => state,

  /**
   * Initial page load or reconnection recovery REST sync
   */
  hydrate: async (storeId?: string, force = false) => {
    const currentStoreId = storeId || storeAuthService.getStoreId() || localStorage.getItem('selfprint_store_id') || undefined;
    if (state.isHydrated && !force && state.isCheckingStatus) return;

    updateState({ isCheckingStatus: true, lastSyncError: null, storeId: currentStoreId || null });
    try {
      const res = await printerService.getConnectorStatus(currentStoreId);
      const raw = res.connector;
      const hbTime = res.lastHeartbeat ? new Date(res.lastHeartbeat).getTime() : null;
      const diffMs = hbTime ? Math.max(0, Date.now() - hbTime) : 999999;
      const diffSec = Math.round(diffMs / 1000);

      const isReallyOnline = Boolean(res.paired && res.isOnline && diffSec <= 35);
      const rawPrinters = Array.isArray(res.physicalPrinters)
        ? res.physicalPrinters
        : (Array.isArray(raw?.physicalPrinters) ? raw.physicalPrinters : []);
      const count = rawPrinters.length;

      let determinedState: ConnectorWizardState = 'NOT_INSTALLED';
      if (!res.paired) {
        determinedState = 'NOT_INSTALLED';
      } else if (isReallyOnline && count > 0) {
        determinedState = 'READY';
      } else if (isReallyOnline) {
        determinedState = 'CONNECTED';
      } else if (res.paired && !isReallyOnline) {
        determinedState = 'INSTALLED_NOT_RUNNING';
      }

      updateState({
        testMode: Boolean((res as any)?.testMode ?? (res as any)?.data?.testMode ?? state.testMode),
        paired: res.paired,
        isOnline: isReallyOnline,
        status: isReallyOnline ? 'ONLINE' : (res.paired ? 'OFFLINE' : 'UNKNOWN'),
        state: determinedState,
        connectorId: (res as any)?.connectorId || raw?.connectorId || state.connectorId,
        storeId: currentStoreId || state.storeId,
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

  setTestMode: (enabled: boolean) => {
    updateState({ testMode: enabled });
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
   * Deduplicates by storeId, connectorId, and timestamp.
   */
  handleSocketHeartbeat: (payload: any) => {
    if (!isPayloadRelevant(payload)) return;

    const hbTimestamp = payload?.timestamp ? new Date(payload.timestamp).getTime() : Date.now();
    if (state.lastHeartbeatTimestamp && hbTimestamp < state.lastHeartbeatTimestamp) {
      return; // Ignore stale or out-of-order heartbeat
    }

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
        connectorId: payload?.connectorId || prev.connectorId,
        hostname: payload?.hostname || payload?.machineName || prev.hostname,
        socketConnected: true,
        authenticated: true,
        hostRunning: true,
        physicalPrinters: updatedPrinters,
        physicalPrinterCount: count,
        lastHeartbeat: payload?.timestamp || payload?.lastHeartbeat || new Date(hbTimestamp).toISOString(),
        lastHeartbeatTimestamp: hbTimestamp,
        diffSeconds: 0
      };
    });
  },

  /**
   * Pure WebSocket In-Memory Mutator: connector:connected
   */
  handleSocketConnected: (payload: any) => {
    if (!isPayloadRelevant(payload)) return;
    const now = Date.now();

    updateState((prev) => ({
      paired: true,
      isOnline: true,
      status: 'ONLINE',
      state: prev.physicalPrinterCount > 0 ? 'READY' : 'CONNECTED',
      connectorId: payload?.connectorId || prev.connectorId,
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
  handleSocketDisconnected: (payload: any) => {
    if (!isPayloadRelevant(payload)) return;

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
    if (!isPayloadRelevant(payload)) return;
    const now = Date.now();

    updateState({
      paired: true,
      isOnline: true,
      status: 'ONLINE',
      state: 'CONNECTED',
      pairingCode: null,
      connectorId: payload?.connectorId || state.connectorId,
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
  handleSocketUnpaired: (payload?: any) => {
    if (payload && !isPayloadRelevant(payload)) return;

    updateState({
      paired: false,
      isOnline: false,
      status: 'OFFLINE',
      state: 'RUNNING_UNPAIRED',
      connectorId: null,
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
   * Deduplicates identical printer payloads
   */
  handlePrintersUpdated: (printers: any[], payload?: any) => {
    if (payload && !isPayloadRelevant(payload)) return;

    const currentJson = JSON.stringify(state.physicalPrinters.map((p) => ({ id: p.id || p.name, status: p.status, isOnline: p.isOnline })));
    const nextJson = JSON.stringify(printers.map((p) => ({ id: p.id || p.name, status: p.status, isOnline: p.isOnline })));
    if (currentJson === nextJson && state.physicalPrinters.length === printers.length) {
      return; // Ignore duplicate identical update
    }

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

// Global Singleton Socket Listener Registration (Registered ONCE across the entire app)
let isSocketSubscribed = false;

export function initConnectorSocketListener() {
  if (isSocketSubscribed || typeof window === 'undefined') return;
  isSocketSubscribed = true;

  try {
    const socket = getSocket();
    if (!socket) return;

    socket.on('store:testModeChanged', (d: any) => {
      const isEnabled = Boolean(d?.testMode ?? d?.enabled);
      console.log('[useConnectorStore] store:testModeChanged received:', isEnabled);
      updateState({ testMode: isEnabled });
    });
    socket.on('test_mode_changed', (d: any) => {
      const isEnabled = Boolean(d?.testMode ?? d?.enabled);
      updateState({ testMode: isEnabled });
    });
    socket.on('connector:heartbeat', (d: any) => connectorStoreActions.handleSocketHeartbeat(d));
    socket.on('heartbeat', (d: any) => connectorStoreActions.handleSocketHeartbeat(d));
    socket.on('connector:connected', (d: any) => connectorStoreActions.handleSocketConnected(d));
    socket.on('connector_connected', (d: any) => connectorStoreActions.handleSocketConnected(d));
    socket.on('connector:disconnected', (d: any) => connectorStoreActions.handleSocketDisconnected(d));
    socket.on('connector_disconnected', (d: any) => connectorStoreActions.handleSocketDisconnected(d));
    socket.on('connector:paired', (d: any) => connectorStoreActions.handleSocketPaired(d));
    socket.on('connector_paired', (d: any) => connectorStoreActions.handleSocketPaired(d));
    socket.on('connector:unpaired', (d: any) => connectorStoreActions.handleSocketUnpaired(d));
    socket.on('connector_unpaired', (d: any) => connectorStoreActions.handleSocketUnpaired(d));
    socket.on('printer:updated', (d: any) => {
      const raw = Array.isArray(d?.printers) ? d.printers : (Array.isArray(d) ? d : []);
      connectorStoreActions.handlePrintersUpdated(raw, d);
    });
    socket.on('printers_updated', (d: any) => {
      const raw = Array.isArray(d?.printers) ? d.printers : (Array.isArray(d) ? d : []);
      connectorStoreActions.handlePrintersUpdated(raw, d);
    });

    console.log('[useConnectorStore] Global socket listeners initialized once.');
  } catch (err) {
    console.error('[useConnectorStore] Socket init error:', err);
  }
}

// Auto-initialize socket listeners in browser
if (typeof window !== 'undefined') {
  initConnectorSocketListener();
}

// Global Watchdog Singleton
let watchdogInterval: NodeJS.Timeout | null = null;
if (typeof window !== 'undefined' && !watchdogInterval) {
  watchdogInterval = setInterval(() => {
    connectorStoreActions.checkHeartbeatTimeout();
  }, 5000);
}

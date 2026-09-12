import { connectorStore } from '../storage/connectorStore';
import { logger } from '../utils/logger';
import { emitEvent, isSocketConnected } from '../websocket/socket';
import { printerCache } from '../printer/printerCache';
import { registrationService } from './registration.service';
import { healthMonitor } from './healthMonitor';

let heartbeatTimer: NodeJS.Timeout | null = null;

/**
 * Dispatches heartbeat with full health telemetry via REST POST /api/v1/connectors/heartbeat and WebSocket.
 */
export async function sendHeartbeat(): Promise<void> {
  const data = connectorStore.getData();
  const identity = connectorStore.getIdentity();



  const health = (await healthMonitor.collectHealthMetrics()) || {
    cpuUsagePercent: 0,
    memory: { totalMB: 0, freeMB: 0, processRssMB: 0 },
    disk: { freeGB: 0, totalGB: 0 },
    windowsUptimeSeconds: 0,
    connectorUptimeSeconds: 0,
    printSpoolerStatus: 'Running',
    hasInternet: true,
    backendLatencyMs: null,
    printerCount: printerCache.getAll().length,
    activeQueueSize: 0,
    timestamp: new Date().toISOString()
  };

  const socketConnected = isSocketConnected();
  const authenticated = connectorStore.isRegistered();
  const physicalPrinters = printerCache.getAll();
  const physicalPrinterCount = physicalPrinters.length;

  const payload = {
    deviceToken: data.deviceToken || undefined,
    connectorId: data.connectorId,
    storeId: data.storeId || undefined,
    socketConnected,
    authenticated,
    hostRunning: true,
    physicalPrinters: physicalPrinterCount,
    physicalPrinterCount,
    machineId: data.machineId,
    version: identity.connectorVersion,
    connectorVersion: identity.connectorVersion,
    latency: health.backendLatencyMs || 0,
    uptime: health.connectorUptimeSeconds,
    printerCount: physicalPrinterCount,
    state: (socketConnected && authenticated) ? 'READY' : (authenticated ? 'HOST_RUNNING' : 'NOT_PAIRED'),
    memoryUsage: {
      totalMB: health.memory.totalMB,
      freeMB: health.memory.freeMB,
      processMB: health.memory.processRssMB
    },
    diskUsage: health.disk,
    cpuUsage: health.cpuUsagePercent,
    spoolerStatus: health.printSpoolerStatus,
    activeQueueSize: health.activeQueueSize,
    timestamp: new Date().toISOString()
  };

  // 1. Log structured lifecycle: Heartbeat sent
  logger.info(`[Heartbeat sent] Dispatched heartbeat (state: ${payload.state}, authenticated: ${authenticated}, socket: ${socketConnected}, printers: ${physicalPrinterCount})`);

  // 2. Emit via WebSocket
  const wsSent = emitEvent('heartbeat', {
    ...payload,
    printers: physicalPrinters.map((p) => ({
      id: p.id,
      name: p.name,
      isDefault: p.isDefault,
      status: p.status,
      connectionType: p.connectionType,
      isOnline: p.isOnline
    })),
    timestamp: new Date().toISOString()
  });

  // 3. Transmit via REST endpoint
  const url = `${data.connectorSettings.backendUrl.replace(/\/$/, '')}/api/v1/connectors/heartbeat`;
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': `SelfPrintConnector/${identity.connectorVersion}`
    };

    const token = connectorStore.getDeviceToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      connectorStore.updateLastHeartbeat();
      logger.info(`[Heartbeat acknowledged] Backend confirmed heartbeat (HTTP ${response.status})`);
    } else if (response.status === 401) {
      logger.warn('Heartbeat rejected (401 Unauthorized): Device token was revoked or unpaired.');
      connectorStore.clearPairing();
    }
  } catch (error) {
    if (wsSent) {
      connectorStore.updateLastHeartbeat();
      logger.info('[Heartbeat acknowledged] Backend confirmed heartbeat via WebSocket');
    } else {
      logger.debug(`Heartbeat HTTP endpoint unreachable (retrying in 10s): ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Starts the recurring 10-second heartbeat beacon.
 */
export function startHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
  }

  const interval = connectorStore.getSettings().heartbeatIntervalMs || 10000;
  logger.info(`Starting Heartbeat Beacon (Interval: ${interval / 1000}s)...`);

  sendHeartbeat();

  heartbeatTimer = setInterval(() => {
    sendHeartbeat();
  }, interval);
}

/**
 * Stops the heartbeat beacon.
 */
export function stopHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

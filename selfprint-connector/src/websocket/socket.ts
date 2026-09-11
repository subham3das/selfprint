import { io, Socket } from 'socket.io-client';
import { connectorStore } from '../storage/connectorStore';
import { spoolerControl } from '../printer/spoolerControl';
import { printerCache } from '../printer/printerCache';
import { printerWatcher } from '../printer/watchPrinters';
import { getPrinterStatus } from '../printer/printerStatus';
import { printJobExecutor } from '../printer/jobExecutor';
import { sendHeartbeat, startHeartbeat } from '../services/heartbeat';
import { offlineQueue } from '../queue/offlineQueue';
import { crashRecovery } from '../recovery/crashRecovery';
import { rotatingLogger } from '../utils/rotatingLogger';
import { PrinterDiff, PrintJobOptions, PrintJobProgress } from '../printer/types';
import { logger } from '../utils/logger';

let socket: Socket | null = null;
let isConnected = false;
let reconnectAttempt = 0;

const RECONNECT_INTERVALS_MS = [2000, 5000, 10000, 20000, 30000];

export function getSocket(): Socket | null {
  return socket;
}

export function isSocketConnected(): boolean {
  return isConnected && socket?.connected === true;
}

/**
 * Initializes the WebSocket connection between the local machine and the SelfPrint Cloud Backend.
 * Implements an automatic reconnect ladder: 2s -> 5s -> 10s -> 20s -> 30s (forever).
 */
export function initSocket(): Socket {
  if (socket) {
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  const { connectorId, machineId, deviceToken, connectorSettings } = connectorStore.getData();
  const identity = connectorStore.getIdentity();

  logger.info(`Connecting Hardware Bridge to Backend at ${connectorSettings.backendUrl}...`);

  socket = io(connectorSettings.backendUrl, {
    auth: (cb) => {
      const curData = connectorStore.getData();
      cb({
        connectorId: curData.connectorId,
        machineId: curData.machineId,
        storeId: curData.storeId || undefined,
        deviceToken: curData.deviceToken || undefined,
        token: curData.deviceToken || undefined,
        hostname: identity.hostname,
        windowsUser: identity.windowsUser,
        version: identity.connectorVersion
      });
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 30000,
    timeout: 10000,
    autoConnect: true
  });

  // Socket Lifecycle Listeners
  socket.on('connect', () => {
    isConnected = true;
    reconnectAttempt = 0;
    logger.info(`Connected to SelfPrint Backend (Socket ID: ${socket?.id})`);

    const curData = connectorStore.getData();

    // 1. Emit connector_online
    socket?.emit('connector_online', {
      connectorId: curData.connectorId,
      machineId: curData.machineId,
      storeId: curData.storeId || undefined,
      deviceToken: curData.deviceToken || undefined,
      hostname: identity.hostname,
      windowsUser: identity.windowsUser,
      version: identity.connectorVersion,
      timestamp: new Date().toISOString()
    });

    // 2. Emit hardware_ready snapshot
    const currentPrinters = printerCache.getAll();
    socket?.emit('hardware_ready', {
      connectorId: curData.connectorId,
      machineId: curData.machineId,
      storeId: curData.storeId || undefined,
      hostname: identity.hostname,
      printers: currentPrinters,
      timestamp: new Date().toISOString()
    });

    // 3. Mark recovery checkpoint as clean
    crashRecovery.saveCheckpoint({ unsentPrinterSync: false });

    // 4. Drain pending offline print jobs
    offlineQueue.drainQueue().catch((err) => {
      logger.error('Failed to drain offline queue on connect:', err);
    });

    // 5. Send immediate heartbeat beacon
    sendHeartbeat().catch(() => {});
  });

  socket.on('disconnect', (reason: string) => {
    isConnected = false;
    logger.warn(`Disconnected from backend. Reason: ${reason}`);
  });

  socket.on('connect_error', (error: Error) => {
    isConnected = false;
    reconnectAttempt++;
    const nextDelayMs = RECONNECT_INTERVALS_MS[Math.min(reconnectAttempt - 1, RECONNECT_INTERVALS_MS.length - 1)];
    logger.debug(`Backend connection unavailable (${error.message}). Retrying in ${nextDelayMs / 1000}s...`);
  });

  socket.on('reconnect', (attempt: number) => {
    isConnected = true;
    reconnectAttempt = 0;
    logger.info(`Reconnected to backend successfully after ${attempt} attempt(s).`);
    const curData = connectorStore.getData();
    socket?.emit('connector_online', {
      connectorId: curData.connectorId,
      machineId: curData.machineId,
      storeId: curData.storeId || undefined,
      deviceToken: curData.deviceToken || undefined,
      hostname: identity.hostname,
      windowsUser: identity.windowsUser,
      version: identity.connectorVersion,
      timestamp: new Date().toISOString()
    });
    sendHeartbeat().catch(() => {});
  });

  // =========================================================================
  // HARDWARE & PRINT PIPELINE COMMANDS FROM BACKEND
  // =========================================================================

  // 1. Ping / Keepalive
  socket.on('ping', () => {
    socket?.emit('pong', { connectorId, timestamp: new Date().toISOString() });
  });

  // 2. Request Immediate Heartbeat
  socket.on('request_heartbeat', async () => {
    logger.info('Received request_heartbeat from backend.');
    await sendHeartbeat();
  });

  // 3. Refresh Printers / Rescan
  const handleRefresh = async () => {
    logger.info('Received refresh_printers command from backend.');
    await printerWatcher.scan(false);
  };
  socket.on('refresh_printers', handleRefresh);
  socket.on('rescan', handleRefresh);

  // 4. Hot Config Reload
  socket.on('update_config', (data: { settings?: Partial<typeof connectorSettings> }) => {
    if (data?.settings) {
      logger.info('Received update_config command from backend. Applying changes without restart...');
      const oldSettings = { ...connectorStore.getSettings() };
      connectorStore.updateSettings(data.settings);
      const newSettings = connectorStore.getSettings();

      // Hot-reload heartbeat interval
      if (data.settings.heartbeatIntervalMs && data.settings.heartbeatIntervalMs !== oldSettings.heartbeatIntervalMs) {
        logger.info(`Heartbeat interval updated to ${newSettings.heartbeatIntervalMs}ms`);
        startHeartbeat();
      }

      // Hot-reload scan interval
      if (data.settings.scanIntervalMs && data.settings.scanIntervalMs !== oldSettings.scanIntervalMs) {
        logger.info(`Printer scan interval updated to ${newSettings.scanIntervalMs}ms`);
        printerWatcher.start();
      }

      // Hot-reload log level
      if (data.settings.logLevel) {
        rotatingLogger.setLogLevel(data.settings.logLevel);
      }

      // Hot-reload backend URL
      if (data.settings.backendUrl && data.settings.backendUrl !== oldSettings.backendUrl) {
        logger.info(`Backend URL updated to ${newSettings.backendUrl}. Reconnecting WebSocket bridge...`);
        disconnectSocket();
        initSocket();
      }
    }
  });

  // 5. Restart Connector Daemon
  socket.on('restart_connector', () => {
    logger.warn('Received restart_connector command from backend. Restarting daemon...');
    process.exit(0);
  });

  // 5b. Connector Unpaired / Ownership Revoked
  socket.on('connector_unpaired', () => {
    logger.warn('Received connector_unpaired event from backend. Revoking local store ownership...');
    const d = connectorStore.getData();
    d.deviceToken = null;
    delete d.storeId;
    connectorStore.save();
  });

  // 6. Execute Print Job (End-to-End Pipeline with Offline Safety)
  const handlePrint = async (data: any) => {
    try {
      if (!data || !data.jobId || (!data.fileUrl && !data.pdfUrl)) {
        logger.warn('Received invalid print job payload.');
        return;
      }

      const options: PrintJobOptions = {
        jobId: data.jobId,
        fileUrl: data.fileUrl || data.pdfUrl,
        printerId: data.printerId,
        printerName: data.printer || data.printerName,
        copies: data.copies,
        paperSize: data.paperSize,
        orientation: data.orientation,
        colorMode: data.colorMode,
        duplex: data.duplex,
        pageRange: data.pageRange,
        checksum: data.checksum,
        timeoutMs: data.timeoutMs
      };

      logger.info(`[Print Pipeline] Received Print Job: ${options.jobId} -> Target: ${options.printerName || 'Default'}`);

      // Check if backend disconnected before execution
      if (!isConnected) {
        logger.warn(`[Offline Mode] Backend disconnected. Enqueueing job ${options.jobId} for execution.`);
        offlineQueue.enqueue(options);
      }

      // Execute print pipeline (continues printing even if backend disconnects)
      await printJobExecutor.execute(options, (progress: PrintJobProgress) => {
        // Stream live status immediately to Backend if connected
        emitEvent('job_status_update', {
          connectorId,
          ...progress
        });

        // Granular legacy events for backward compatibility
        if (progress.status === 'PRINTING') {
          emitEvent('job_started', { connectorId, jobId: progress.jobId, printer: progress.printerName });
        } else if (progress.status === 'PAGE_PROGRESS') {
          emitEvent('job_progress', { connectorId, jobId: progress.jobId, progress: progress.currentPage, total: progress.totalPages });
        } else if (progress.status === 'COMPLETED') {
          emitEvent('job_completed', { connectorId, jobId: progress.jobId, printer: progress.printerName });
        } else if (progress.status === 'FAILED') {
          emitEvent('job_failed', { connectorId, jobId: progress.jobId, error: progress.error });
        } else if (progress.status === 'CANCELLED') {
          emitEvent('job_cancelled', { connectorId, jobId: progress.jobId });
        }
      });
    } catch (err) {
      logger.error('Error in handlePrint execution:', err);
    }
  };

  socket.on('print_pdf', handlePrint);
  socket.on('new_print_job', handlePrint);

  // 7. Cancel Print Job
  socket.on('cancel_job', async (data: { jobId?: string; printer?: string }) => {
    logger.info(`[Command: Cancel Job] Job ID: ${data?.jobId || 'ALL'}`);
    if (data?.jobId) {
      printJobExecutor.cancel(data.jobId);
    }
    const printerName = data?.printer || printerCache.getDefault()?.name || '';
    const res = await spoolerControl.cancelJob(printerName, data?.jobId);
    emitEvent('job_cancelled', {
      connectorId,
      jobId: data?.jobId,
      printerName,
      success: res.success,
      timestamp: new Date().toISOString()
    });
  });

  // 8. Pause Printer / Pause Job
  const handlePause = async (data: { printer?: string }) => {
    const printerName = data?.printer || printerCache.getDefault()?.name || '';
    logger.info(`[Command: Pause Printer] ${printerName}`);
    const res = await spoolerControl.pausePrinter(printerName);
    emitEvent('printer_paused', {
      connectorId,
      printerName,
      success: res.success,
      timestamp: new Date().toISOString()
    });
  };
  socket.on('pause_printer', handlePause);
  socket.on('pause_job', handlePause);

  // 9. Resume Printer / Resume Job
  const handleResume = async (data: { printer?: string }) => {
    const printerName = data?.printer || printerCache.getDefault()?.name || '';
    logger.info(`[Command: Resume Printer] ${printerName}`);
    const res = await spoolerControl.resumePrinter(printerName);
    emitEvent('printer_online', {
      connectorId,
      printerName,
      success: res.success,
      timestamp: new Date().toISOString()
    });
  };
  socket.on('resume_printer', handleResume);
  socket.on('resume_job', handleResume);

  // 10. Restart Printer
  socket.on('restart_printer', async (data: { printer?: string }) => {
    const printerName = data?.printer || printerCache.getDefault()?.name || '';
    logger.info(`[Command: Restart Printer Queue] ${printerName}`);
    await spoolerControl.restartPrinter(printerName);
  });

  // 11. Get Printer Information
  socket.on('get_printer_info', (data: { printerId?: string; requestId?: string }) => {
    const printers = data?.printerId ? printerCache.getById(data.printerId) || printerCache.getByName(data.printerId) : printerCache.getAll();
    emitEvent('printer_info_response', {
      connectorId,
      requestId: data?.requestId,
      data: printers,
      timestamp: new Date().toISOString()
    });
  });

  // 12. Get Printer Status
  socket.on('get_printer_status', async (data: { printerName: string; requestId?: string }) => {
    const status = await getPrinterStatus(data?.printerName);
    emitEvent('printer_status_response', {
      connectorId,
      requestId: data?.requestId,
      printerName: data?.printerName,
      status,
      timestamp: new Date().toISOString()
    });
  });

  return socket;
}

/**
 * Emits an event safely over WebSocket connection.
 */
export function emitEvent(eventName: string, data: unknown): boolean {
  if (socket && isConnected) {
    socket.emit(eventName, data);
    return true;
  }
  return false;
}

export { emitEvent as emitSocketEvent };

/**
 * Broadcasts hardware diff events to backend.
 */
export function broadcastPrinterDiff(diff: PrinterDiff): void {
  if (!socket || !isConnected) return;

  const { connectorId } = connectorStore.getData();

  // 1. Added
  for (const printer of diff.added) {
    socket.emit('printer_added', {
      connectorId,
      printer,
      timestamp: new Date().toISOString()
    });
  }

  // 2. Removed
  for (const printer of diff.removed) {
    socket.emit('printer_removed', {
      connectorId,
      printerId: printer.id,
      printerName: printer.name,
      timestamp: new Date().toISOString()
    });
  }

  // 3. Status Changed & Hardware Alerts
  for (const sc of diff.statusChanged) {
    const payload = {
      connectorId,
      printerId: sc.printer.id,
      printerName: sc.printer.name,
      previousStatus: sc.previousStatus,
      currentStatus: sc.currentStatus,
      timestamp: new Date().toISOString()
    };

    if (sc.currentStatus === 'ONLINE') {
      socket.emit('printer_online', payload);
    } else if (sc.currentStatus === 'OFFLINE') {
      socket.emit('printer_offline', payload);
    } else if (sc.currentStatus === 'PAUSED') {
      socket.emit('printer_paused', payload);
    } else if (sc.currentStatus === 'PAPER_JAM') {
      socket.emit('paper_changed', { ...payload, state: 'PAPER_JAM' });
      socket.emit('printer_error', { ...payload, errorType: 'PAPER_JAM' });
    } else if (sc.currentStatus === 'OUT_OF_PAPER') {
      socket.emit('paper_empty', payload);
      socket.emit('paper_changed', { ...payload, state: 'EMPTY' });
    } else if (sc.currentStatus === 'LOW_TONER') {
      socket.emit('toner_low', payload);
      socket.emit('toner_changed', { ...payload, state: 'LOW' });
    } else if (sc.currentStatus === 'ERROR') {
      socket.emit('printer_error', payload);
    }
  }

  // 4. Default Changed
  if (diff.defaultChanged) {
    socket.emit('default_changed', {
      connectorId,
      previousDefault: diff.defaultChanged.previousDefault?.name || null,
      currentDefault: diff.defaultChanged.currentDefault?.name || null,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Cleanly disconnects the socket.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.emit('connector_offline', {
      connectorId: connectorStore.getData().connectorId,
      timestamp: new Date().toISOString()
    });
    socket.disconnect();
    socket = null;
    isConnected = false;
  }
}

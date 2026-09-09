import { connectorService } from './service';
import { connectorAuditService } from './audit.service';
import { connectorWatchdog } from './watchdog';
import { StoreNotificationPayload } from './types';

let globalIo: any = null;

/**
 * Socket.IO Gateway for SelfPrint Connector Network.
 */
export function setupConnectorSocketGateway(io: any): void {
  globalIo = io;
  connectorWatchdog.attachSocketIO(io);
  connectorWatchdog.start();

  // Authentication Middleware
  io.use((socket: any, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token || socket.handshake.auth?.deviceToken;
    const connectorId = socket.handshake.auth?.connectorId;

    if (!token) {
      return next(new Error('Authentication Error: Missing deviceToken'));
    }

    const verification = connectorService.verifyDeviceToken(token);
    if (!verification.isValid || (connectorId && verification.connectorId !== connectorId)) {
      return next(new Error('Authentication Error: Invalid or rejected deviceToken'));
    }

    socket.connector = {
      connectorId: verification.connectorId,
      machineId: verification.machineId
    };

    next();
  });

  io.on('connection', async (socket: any) => {
    const { connectorId, machineId } = socket.connector;
    const room = `connector:${connectorId}`;
    socket.join(room);

    // Fetch connector record to attach to store room
    const connector = await connectorService.getConnectorById(connectorId);
    if (connector?.storeId) {
      socket.join(`store:${connector.storeId}`);
    }

    // 1. Connector Online Notification
    socket.on('connector_online', async (data: any) => {
      await connectorService.updateStatus(connectorId, 'ONLINE', 'CONNECTOR');
      await connectorAuditService.log(connectorId, 'ONLINE', { machineId, hostname: data?.hostname }, 'CONNECTOR');

      const payload = {
        connectorId,
        machineId,
        hostname: data?.hostname || connector?.hostname,
        version: data?.version || connector?.connectorVersion,
        status: 'ONLINE',
        storeId: connector?.storeId || null,
        timestamp: new Date().toISOString()
      };

      io.emit('connector_status_change', payload);

      if (connector?.storeId) {
        io.to(`store:${connector.storeId}`).emit('store_connector_status', payload);
      }

      // Automatically drain and execute any queued store commands
      const pending = connectorService.drainPendingCommands(connectorId);
      if (pending.length > 0) {
        console.log(`[SocketGateway] Draining ${pending.length} pending commands for connector ${connectorId}`);
        for (const cmd of pending) {
          io.to(room).emit(cmd.command, cmd.payload || {});
          await connectorAuditService.log(connectorId, 'REMOTE_COMMAND', { command: cmd.command, queued: true }, cmd.performedBy);
        }
      }
    });

    // 2. Hardware Ready / Snapshot
    socket.on('hardware_ready', async (data: any) => {
      if (Array.isArray(data?.printers)) {
        const syncRes = await connectorService.syncPrinters({ connectorId, printers: data.printers });
        const storeId = syncRes.connector?.storeId || connector?.storeId;

        io.emit('connector_printers_synced', { connectorId, printerCount: data.printers.length });

        if (storeId) {
          io.to(`store:${storeId}`).emit('store_printers_updated', {
            connectorId,
            printers: data.printers,
            count: data.printers.length,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // 3. Heartbeat Event (Every 15s)
    socket.on('heartbeat', async (data: any) => {
      const hbRes = await connectorService.processHeartbeat({
        connectorId,
        machineId,
        uptime: data?.uptime || 0,
        printerCount: Array.isArray(data?.printers) ? data.printers.length : (data?.printerCount || 0),
        memoryUsage: data?.memoryUsage,
        diskUsage: data?.diskUsage,
        cpuUsage: data?.cpuUsage,
        spoolerStatus: data?.spoolerStatus,
        activeQueueSize: data?.activeQueueSize,
        connectorVersion: data?.connectorVersion
      });

      const storeId = hbRes.connector?.storeId || connector?.storeId;

      io.emit('connector_heartbeat_received', { connectorId, timestamp: new Date().toISOString() });

      if (storeId) {
        io.to(`store:${storeId}`).emit('store_connector_health', {
          connectorId,
          cpuUsage: data?.cpuUsage || 0,
          memory: data?.memoryUsage,
          disk: data?.diskUsage,
          spoolerStatus: data?.spoolerStatus || 'Running',
          activeQueueSize: data?.activeQueueSize || 0,
          uptime: data?.uptime || 0,
          lastHeartbeat: new Date().toISOString()
        });
      }
    });

    // 4. Printer Sync Event
    socket.on('printer_sync', async (data: any) => {
      if (Array.isArray(data?.printers)) {
        const syncRes = await connectorService.syncPrinters({ connectorId, printers: data.printers });
        const storeId = syncRes.connector?.storeId || connector?.storeId;

        if (storeId) {
          io.to(`store:${storeId}`).emit('store_printers_updated', {
            connectorId,
            printers: data.printers,
            count: data.printers.length,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // 5. Granular Hardware Diffs (Live Printer Monitoring)
    const handleHardwareDiff = (eventType: string, data: any) => {
      io.emit(eventType, { connectorId, ...data });
      if (connector?.storeId) {
        io.to(`store:${connector.storeId}`).emit('store_printer_event', {
          connectorId,
          eventType,
          ...data,
          timestamp: new Date().toISOString()
        });
      }
    };

    socket.on('printer_added', (data: any) => handleHardwareDiff('printer_added', data));
    socket.on('printer_removed', (data: any) => handleHardwareDiff('printer_removed', data));
    socket.on('printer_online', (data: any) => handleHardwareDiff('printer_online', data));
    socket.on('printer_offline', (data: any) => handleHardwareDiff('printer_offline', data));
    socket.on('printer_error', (data: any) => handleHardwareDiff('printer_error', data));
    socket.on('paper_changed', (data: any) => handleHardwareDiff('paper_changed', data));
    socket.on('paper_empty', (data: any) => handleHardwareDiff('paper_empty', data));
    socket.on('toner_changed', (data: any) => handleHardwareDiff('toner_changed', data));
    socket.on('toner_low', (data: any) => handleHardwareDiff('toner_low', data));
    socket.on('default_changed', (data: any) => handleHardwareDiff('default_changed', data));

    // 6. Print Job Streaming Events
    socket.on('job_status_update', (data: any) => {
      io.emit('job_status_update', { connectorId, ...data });
      if (connector?.storeId) {
        io.to(`store:${connector.storeId}`).emit('store_job_progress', {
          connectorId,
          ...data,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Disconnect Handler
    socket.on('disconnect', async () => {
      io.emit('connector_status_change', { connectorId, status: 'DISCONNECTED', timestamp: new Date().toISOString() });
      if (connector?.storeId) {
        io.to(`store:${connector.storeId}`).emit('store_connector_status', {
          connectorId,
          status: 'OFFLINE',
          timestamp: new Date().toISOString()
        });
      }
    });
  });
}

/**
 * Command Dispatcher: Sends remote command to connector room.
 * If connector is offline, queues the command for automatic execution on reconnect.
 */
export async function sendCommandToConnector(
  connectorId: string,
  command: string,
  payload?: any,
  performedBy = 'STORE_ADMIN'
): Promise<{ success: boolean; queued?: boolean; message: string }> {
  if (!globalIo) {
    return { success: false, message: 'Socket Gateway not initialized' };
  }

  const connector = await connectorService.getConnectorById(connectorId);
  if (!connector) {
    return { success: false, message: 'Connector not found' };
  }

  const room = `connector:${connectorId}`;
  const clients = globalIo.sockets.adapter?.rooms?.get(room);
  const isOnline = Boolean(clients && clients.size > 0 && connector.status === 'ONLINE');

  if (isOnline) {
    globalIo.to(room).emit(command, payload || {});
    await connectorAuditService.log(
      connectorId,
      'REMOTE_COMMAND',
      { command, payload: payload || null, status: 'DISPATCHED_INSTANTLY' },
      performedBy
    );
    return { success: true, queued: false, message: `Command [${command}] dispatched instantly.` };
  } else {
    // Queue command for reconnection
    const storeId = connector.storeId || 'unassigned';
    connectorService.queueCommand({
      connectorId,
      storeId,
      command,
      payload: payload || {},
      performedBy
    });

    await connectorAuditService.log(
      connectorId,
      'REMOTE_COMMAND',
      { command, payload: payload || null, status: 'QUEUED_OFFLINE' },
      performedBy
    );

    return {
      success: true,
      queued: true,
      message: `Connector is currently offline. Command [${command}] queued for automatic execution upon reconnection.`
    };
  }
}

/**
 * Notification Bridge: Dispatches notification to Store Dashboard AND Connector Desktop simultaneously.
 */
export async function dispatchNotificationBridge(
  connectorId: string,
  storeId: string,
  notification: StoreNotificationPayload,
  performedBy = 'SYSTEM'
): Promise<boolean> {
  if (!globalIo) return false;

  // 1. Emit to Desktop App
  globalIo.to(`connector:${connectorId}`).emit('notification', {
    type: 'notification',
    title: notification.title,
    message: notification.message,
    severity: notification.severity,
    timestamp: new Date().toISOString()
  });

  // 2. Emit to Store Dashboard
  globalIo.to(`store:${storeId}`).emit('store_notification', {
    connectorId,
    storeId,
    title: notification.title,
    message: notification.message,
    severity: notification.severity,
    timestamp: new Date().toISOString()
  });

  return true;
}

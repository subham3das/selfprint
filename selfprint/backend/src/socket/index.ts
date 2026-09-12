import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils';

class SocketManager {
  private io: SocketIOServer | null = null;
  public isInitialized = false;

  public init(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: (origin, callback) => {
          // Allow all origins with credentials support
          callback(null, true);
        },
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info(`🔌 Socket connected: ${socket.id}`);

      const auth = socket.handshake.auth || {};
      if (auth.connectorId) {
        (socket as any).connectorId = auth.connectorId;
        socket.join('connectors');
      }
      if (auth.storeId) {
        (socket as any).storeId = auth.storeId;
        socket.join(`store:${auth.storeId}`);
      }

      // Admin Room Subscription
      socket.on('join_admin', () => {
        socket.join('admin');
        logger.info(`🛡️ Socket ${socket.id} joined admin room`);
      });

      // Store Room Subscription
      socket.on('join_store', (storeId: string) => {
        if (storeId) {
          socket.join(`store:${storeId}`);
          logger.info(`🏪 Socket ${socket.id} joined store:${storeId}`);
        }
      });

      // Customer Job Tracking Subscription
      socket.on('join_job', (jobId: string) => {
        if (jobId) {
          socket.join(`job:${jobId}`);
          logger.info(`📄 Socket ${socket.id} joined job:${jobId}`);
        }
      });

      // Desktop Connector Registration
      socket.on('register_connector', async (data: { connectorId: string; machineId?: string; storeId?: string }) => {
        (socket as any).connectorId = data.connectorId;
        (socket as any).storeId = data.storeId;
        socket.join('connectors');
        if (data.storeId) {
          socket.join(`store:${data.storeId}`);
        }
        logger.info(`🖨️ Connector registered on socket ${socket.id}: ${data.connectorId}`);

        try {
          const { connectorRegistry } = await import('../modules/connector/connector.service');
          await connectorRegistry.registerConnector({
            connectorId: data.connectorId,
            storeId: data.storeId || 'default',
            hostname: 'Desktop Host',
            machineId: data.machineId || 'unknown',
            version: '1.0.0'
          });
        } catch (err) {
          logger.warn('Failed to register in connectorRegistry:', err);
        }

        this.emitToStore(data.storeId || 'default', 'connector_status', {
          status: 'Connected',
          state: 'CONNECTED',
          connectorId: data.connectorId,
          timestamp: new Date().toISOString()
        });
        this.emitToStore(data.storeId || 'default', 'connector_connected', {
          connectorId: data.connectorId,
          status: 'ONLINE',
          state: 'CONNECTED',
          timestamp: new Date().toISOString()
        });
      });

      // Inbound: connector_online
      socket.on('connector_online', async (data: any) => {
        const connectorId = data.connectorId;
        const storeId = data.storeId || (socket as any).storeId;
        (socket as any).connectorId = connectorId;
        socket.join('connectors');
        if (storeId) {
          (socket as any).storeId = storeId;
          socket.join(`store:${storeId}`);
        }

        // Immediately update MongoDB ConnectorModel so web dashboard reflects ONLINE state
        try {
          const { ConnectorModel } = await import('../models/connector.model');
          const mongoose = await import('mongoose');
          const updateFields: any = {
            status: 'ONLINE',
            state: 'CONNECTED',
            socketConnected: true,
            hostRunning: true,
            lastSeen: new Date(),
            lastHeartbeat: new Date()
          };
          if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
            updateFields.storeId = storeId;
          }
          if (data.hostname) {
            updateFields.hostname = data.hostname;
          }
          if (data.version) {
            updateFields.version = data.version;
          }
          await ConnectorModel.findOneAndUpdate(
            { connectorId },
            { $set: updateFields },
            { new: true }
          );
          logger.info(`[Status updated in MongoDB] Connector ${connectorId} marked ONLINE via socket`);
        } catch (dbErr) {
          logger.warn('Failed to update ConnectorModel on connector_online:', dbErr);
        }

        try {
          const { connectorRegistry } = await import('../modules/connector/connector.service');
          await connectorRegistry.registerConnector({
            connectorId: data.connectorId,
            storeId: storeId || 'default',
            hostname: data.hostname || 'Host Device',
            machineId: data.machineId || 'unknown',
            version: data.version || '1.0.0'
          });
        } catch (e) {
          logger.warn('Error in connector_online registration:', e);
        }

        const targetStore = storeId || 'default';
        this.emitToStore(targetStore, 'connector_connected', {
          connectorId: data.connectorId,
          storeId: targetStore,
          status: 'ONLINE',
          state: 'CONNECTED',
          timestamp: new Date().toISOString()
        });
      });

      // Inbound: connector_offline
      socket.on('connector_offline', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'connector_disconnected', {
          connectorId: data?.connectorId || (socket as any).connectorId,
          reason: data?.reason || 'Connector stopped',
          timestamp: new Date().toISOString()
        });
      });

      // Inbound: heartbeat
      socket.on('heartbeat', async (data: any) => {
        const connectorId = data?.connectorId || (socket as any).connectorId;
        const storeId = data?.storeId || (socket as any).storeId;
        try {
          const { connectorRegistry } = await import('../modules/connector/connector.service');
          connectorRegistry.recordHeartbeat(connectorId, data?.health || data?.telemetry);

          const { ConnectorModel } = await import('../models/connector.model');
          const count = data?.physicalPrinterCount !== undefined
            ? data.physicalPrinterCount
            : (Array.isArray(data?.printers) ? data.printers.length : 0);

          const updateObj: any = {
            lastHeartbeat: new Date(),
            lastSeen: new Date(),
            status: 'ONLINE',
            state: data?.state || 'READY',
            hostRunning: data?.hostRunning !== undefined ? data.hostRunning : true,
            authenticated: data?.authenticated !== undefined ? data.authenticated : true,
            socketConnected: true,
            connectedPrinters: count
          };
          if (Array.isArray(data?.printers)) {
            updateObj.physicalPrinters = data.printers;
          }

          const updatedConnector = await ConnectorModel.findOneAndUpdate(
            { connectorId },
            { $set: updateObj },
            { new: true }
          );
          logger.info(`[Status updated in MongoDB] Connector ${connectorId} heartbeat updated via socket (state: ${updateObj.state}, auth: ${updateObj.authenticated})`);

          const targetStoreId = storeId || updatedConnector?.storeId?.toString() || 'default';
          this.emitToStore(targetStoreId, 'heartbeat', {
            connectorId,
            storeId: targetStoreId,
            status: 'ONLINE',
            state: updateObj.state,
            paired: true,
            authenticated: updateObj.authenticated,
            socketConnected: true,
            hostRunning: updateObj.hostRunning,
            printerCount: count,
            printersCount: count,
            lastHeartbeat: updateObj.lastHeartbeat,
            health: data?.health || data?.telemetry,
            timestamp: data?.timestamp || new Date().toISOString()
          });

          if (Array.isArray(data?.printers) && data.printers.length > 0) {
            this.emitToStore(targetStoreId, 'printers_updated', {
              connectorId,
              printers: data.printers,
              count: data.printers.length,
              timestamp: new Date().toISOString()
            });
          }
        } catch (err) {
          logger.warn('Error handling socket heartbeat:', err);
        }
      });

      // Desktop Connector Printer Sync Event
      socket.on('printer_sync', async (payload: { connectorId: string; machineId: string; printers: any[]; storeId?: string }) => {
        try {
          const storeId = payload.storeId || (socket as any).storeId;
          const { printerService } = await import('../modules/printer/printer.service');
          await printerService.syncPrinters(storeId, payload.connectorId, payload.machineId, payload.printers);
          const { connectorRegistry } = await import('../modules/connector/connector.service');
          await connectorRegistry.updatePrinters(payload.connectorId, payload.printers);
        } catch (err) {
          logger.error('Failed to handle printer_sync socket event:', err);
        }
      });

      // Inbound: scan_started
      socket.on('scan_started', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'hardware_scan_started', {
          connectorId: data?.connectorId,
          timestamp: new Date().toISOString()
        });
      });

      // Inbound: scan_completed / hardware_ready
      const handleScanCompleted = async (payload: any) => {
        const storeId = payload.storeId || (socket as any).storeId || 'default';
        if (payload.printers && Array.isArray(payload.printers)) {
          try {
            const { printerService } = await import('../modules/printer/printer.service');
            await printerService.syncPrinters(storeId, payload.connectorId, payload.machineId, payload.printers);
            const { connectorRegistry } = await import('../modules/connector/connector.service');
            await connectorRegistry.updatePrinters(payload.connectorId, payload.printers);
          } catch (err) {
            logger.error('Failed to sync printers on scan_completed:', err);
          }
        }
        this.emitToStore(storeId, 'hardware_scan_completed', {
          connectorId: payload.connectorId,
          count: payload.printers?.length || 0,
          timestamp: new Date().toISOString()
        });
        this.emitToStore(storeId, 'printers_updated', {
          connectorId: payload.connectorId,
          printers: payload.printers,
          timestamp: new Date().toISOString()
        });
      };
      socket.on('scan_completed', handleScanCompleted);
      socket.on('hardware_ready', handleScanCompleted);

      // Inbound: printer_added
      socket.on('printer_added', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'printer_status_changed', {
          type: 'ADDED',
          printer: data?.printer,
          timestamp: new Date().toISOString()
        });
        this.emitToStore(storeId, 'notification', {
          type: 'success',
          title: 'Printer Connected',
          message: `Printer ${data?.printer?.name || 'Device'} is now online.`,
          timestamp: new Date().toISOString()
        });
        this.emitToStore(storeId, 'toast', {
          severity: 'success',
          title: 'Printer Connected',
          message: `${data?.printer?.name || 'Device'} is ready.`
        });
      });

      // Inbound: printer_removed
      socket.on('printer_removed', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'printer_status_changed', {
          type: 'REMOVED',
          printerName: data?.printerName,
          timestamp: new Date().toISOString()
        });
        this.emitToStore(storeId, 'notification', {
          type: 'warning',
          title: 'Printer Offline',
          message: `Printer ${data?.printerName || 'Device'} was disconnected.`,
          timestamp: new Date().toISOString()
        });
      });

      // Inbound: printer_updated
      socket.on('printer_updated', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'printers_updated', data);
      });

      // Inbound: paper_low / paper_empty
      socket.on('paper_low', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'notification', {
          type: 'warning',
          title: 'Paper Low',
          message: `Printer ${data?.printerName || ''} paper level is low.`,
          timestamp: new Date().toISOString()
        });
      });
      socket.on('paper_empty', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'notification', {
          type: 'error',
          title: 'Paper Empty',
          message: `Printer ${data?.printerName || ''} is out of paper.`,
          timestamp: new Date().toISOString()
        });
      });

      // Inbound: toner_low
      socket.on('toner_low', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'notification', {
          type: 'warning',
          title: 'Toner Low',
          message: `Printer ${data?.printerName || ''} toner is low.`,
          timestamp: new Date().toISOString()
        });
      });

      // Inbound: queue_changed
      socket.on('queue_changed', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'queue_changed', data);
      });

      // Inbound: host_restart
      socket.on('host_restart', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'connector_reconnecting', {
          connectorId: data?.connectorId,
          message: 'Host service restarting...',
          timestamp: new Date().toISOString()
        });
      });

      // Inbound: internet_lost / internet_restored
      socket.on('internet_lost', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'connector_disconnected', {
          reason: 'Internet Lost',
          timestamp: new Date().toISOString()
        });
      });
      socket.on('internet_restored', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'connector_connected', {
          status: 'ONLINE',
          timestamp: new Date().toISOString()
        });
      });

      // Inbound: command_ack
      socket.on('command_ack', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'command_result', {
          commandId: data?.commandId,
          success: data?.success,
          result: data?.result,
          error: data?.error,
          timestamp: new Date().toISOString()
        });
      });

      // Connector Status Change
      socket.on('connector_status', (data: { status: string; state?: string; connectorId?: string; storeId?: string }) => {
        const storeId = data.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'connector_status', {
          ...data,
          connectorId: data.connectorId || (socket as any).connectorId,
          timestamp: new Date().toISOString()
        });
      });

      // Bidirectional Printer Notification Event
      socket.on('printer_notification', (data: { type: string; title: string; message: string; storeId?: string }) => {
        const storeId = data.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'printer_notification', {
          ...data,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('disconnect', (reason) => {
        const connectorId = (socket as any).connectorId;
        const storeId = (socket as any).storeId;
        logger.info(`🔌 Socket transport disconnected: ${socket.id} (connector: ${connectorId || 'none'}, store: ${storeId || 'none'}, reason: ${reason})`);
        // Note: Do not immediately mark connector OFFLINE or broadcast connector_disconnected here.
        // Transport drops can be temporary (reconnects, upgrades, network blips).
        // Authoritative offline status is handled by connector.service heartbeat liveness checker (35s grace).
      });
    });

    this.isInitialized = true;
    logger.info('🚀 WebSocket & Socket.io server initialized successfully');
    return this.io;
  }

  public emitToStore(storeId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`store:${storeId}`).emit(event, data);
      this.io.to('admin').emit(event, data);
      this.io.emit(event, data); // Global broadcast fallback
    }
  }

  public emitToJob(jobId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`job:${jobId}`).emit(event, data);
      this.io.to('admin').emit(event, data);
    }
  }

  public broadcastToStore(storeId: string, event: string, data: any): void {
    this.emitToStore(storeId, event, data);
  }
}

export const socketManager = new SocketManager();
export default socketManager;

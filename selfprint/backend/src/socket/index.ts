import { runtimeService } from '../services/runtime.service';
import mongoose from 'mongoose';
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
      logger.info(`[Socket] 🔌 Client connected: ${socket.id}`);

      const auth = socket.handshake.auth || {};
      if (auth.connectorId) {
        (socket as any).connectorId = auth.connectorId;
        socket.join('connectors');
      }
      if (auth.storeId) {
        (socket as any).storeId = auth.storeId;
        socket.join(`store:${auth.storeId}`);
      }

      socket.on('join_admin', () => {
        socket.join('admin');
        logger.info(`[Socket] 🛡️ Socket ${socket.id} joined admin room`);
      });

      socket.on('join_store', (storeId: string) => {
        if (storeId) {
          socket.join(`store:${storeId}`);
          logger.info(`[Socket] 🏪 Socket ${socket.id} joined store:${storeId}`);
        }
      });

      socket.on('join_job', (jobId: string) => {
        if (jobId) {
          socket.join(`job:${jobId}`);
          logger.info(`[Socket] 📄 Socket ${socket.id} joined job:${jobId}`);
        }
      });

      socket.on('register_connector', async (data: { connectorId: string; machineId?: string; storeId?: string }) => {
        (socket as any).connectorId = data.connectorId;
        (socket as any).storeId = data.storeId;
        socket.join('connectors');
        if (data.storeId) {
          socket.join(`store:${data.storeId}`);
        }
        logger.info(`[Socket] 🖨️ Connector registered on socket ${socket.id}: ${data.connectorId}`);

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
          logger.warn('[Socket] Failed to register in connectorRegistry:', err);
        }

        const payload = {
          connectorId: data.connectorId,
          storeId: data.storeId || 'default',
          status: 'ONLINE',
          state: 'CONNECTED',
          socketConnected: true,
          timestamp: new Date().toISOString()
        };

        this.emitToStore(data.storeId || 'default', 'connector:connected', payload);
        this.emitToStore(data.storeId || 'default', 'connector_connected', payload);
        this.emitToStore(data.storeId || 'default', 'connector_status', { ...payload, status: 'Connected' });
      });

      socket.on('connector_online', async (data: any) => {
        const connectorId = data.connectorId;
        const storeId = data.storeId || (socket as any).storeId;
        (socket as any).connectorId = connectorId;
        socket.join('connectors');
        if (storeId) {
          (socket as any).storeId = storeId;
          socket.join(`store:${storeId}`);
        }

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
          logger.info(`[Socket] Connector ${connectorId} marked ONLINE in DB`);
        } catch (dbErr) {
          logger.warn('[Socket] Failed to update ConnectorModel on connector_online:', dbErr);
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
          logger.warn('[Socket] Error in connector_online registration:', e);
        }

        const targetStore = storeId || 'default';
        const connPayload = {
          connectorId: data.connectorId,
          storeId: targetStore,
          status: 'ONLINE',
          state: 'CONNECTED',
          socketConnected: true,
          timestamp: new Date().toISOString()
        };
        this.emitToStore(targetStore, 'connector:connected', connPayload);
        this.emitToStore(targetStore, 'connector_connected', connPayload);
        runtimeService.handleConnectorOnline(targetStore, {
          connectorId: data.connectorId,
          version: data.version,
          hostname: data.hostname,
          printers: data.printers,
          testMode: data.testMode
        });

        // Transmit current persisted Store Test Mode directly to newly connected connector
        try {
          if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
            const { StoreModel } = await import('../models/store.model');
            const targetStoreDoc = await StoreModel.findById(storeId).select('testMode').lean();
            if (targetStoreDoc && targetStoreDoc.testMode !== undefined) {
              const tmPayload = { storeId: storeId.toString(), testMode: Boolean(targetStoreDoc.testMode) };
              socket.emit('store:testModeChanged', tmPayload);
              socket.emit('test_mode_changed', tmPayload);
              logger.info(`[Socket] Synced persisted testMode (${targetStoreDoc.testMode}) to connector ${connectorId}`);
            }
          }
        } catch (tmErr) {
          logger.warn('[Socket] Failed to sync testMode to connector:', tmErr);
        }
      });

      socket.on('connector_offline', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        const connectorId = data?.connectorId || (socket as any).connectorId;
        const offPayload = {
          connectorId,
          storeId,
          status: 'OFFLINE',
          state: 'OFFLINE',
          socketConnected: false,
          reason: data?.reason || 'Connector stopped',
          timestamp: new Date().toISOString()
        };
        this.emitToStore(storeId, 'connector:disconnected', offPayload);
        this.emitToStore(storeId, 'connector_disconnected', offPayload);
        runtimeService.handleConnectorOffline(storeId, data);
      });

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

          const targetStoreId = storeId || updatedConnector?.storeId?.toString() || 'default';
          const hbPayload = {
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
            physicalPrinterCount: count,
            lastHeartbeat: updateObj.lastHeartbeat,
            health: data?.health || data?.telemetry,
            timestamp: data?.timestamp || new Date().toISOString()
          };

          this.emitToStore(targetStoreId, 'connector:heartbeat', hbPayload);
          this.emitToStore(targetStoreId, 'heartbeat', hbPayload);

          if (Array.isArray(data?.printers) && data.printers.length > 0) {
            const pPayload = {
              connectorId,
              storeId: targetStoreId,
              printers: data.printers,
              count: data.printers.length,
              timestamp: new Date().toISOString()
            };
            this.emitToStore(targetStoreId, 'printer:updated', pPayload);
            this.emitToStore(targetStoreId, 'printers_updated', pPayload);
          }
        } catch (err) {
          logger.warn('[Socket] Error handling socket heartbeat:', err);
        }
      });

      socket.on('printer_sync', async (payload: { connectorId: string; machineId: string; printers: any[]; storeId?: string }) => {
        try {
          const storeId = payload.storeId || (socket as any).storeId || 'default';
          const { printerService } = await import('../modules/printer/printer.service');
          await printerService.syncPrinters(storeId, payload.connectorId, payload.machineId, payload.printers);
          const { connectorRegistry } = await import('../modules/connector/connector.service');
          await connectorRegistry.updatePrinters(payload.connectorId, payload.printers);

          const pPayload = {
            connectorId: payload.connectorId,
            storeId,
            printers: payload.printers,
            count: payload.printers?.length || 0,
            timestamp: new Date().toISOString()
          };
          this.emitToStore(storeId, 'printer:updated', pPayload);
          this.emitToStore(storeId, 'printers_updated', pPayload);
        } catch (err) {
          logger.error('[Socket] Failed to handle printer_sync socket event:', err);
        }
      });

      socket.on('scan_started', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'hardware_scan_started', {
          connectorId: data?.connectorId,
          timestamp: new Date().toISOString()
        });
      });

      const handleScanCompleted = async (payload: any) => {
        const storeId = payload.storeId || (socket as any).storeId || 'default';
        if (payload.printers && Array.isArray(payload.printers)) {
          try {
            const { printerService } = await import('../modules/printer/printer.service');
            await printerService.syncPrinters(storeId, payload.connectorId, payload.machineId, payload.printers);
            const { connectorRegistry } = await import('../modules/connector/connector.service');
            await connectorRegistry.updatePrinters(payload.connectorId, payload.printers);
          } catch (err) {
            logger.error('[Socket] Failed to sync printers on scan_completed:', err);
          }
        }
        const pPayload = {
          connectorId: payload.connectorId,
          storeId,
          printers: payload.printers || [],
          count: payload.printers?.length || 0,
          timestamp: new Date().toISOString()
        };
        this.emitToStore(storeId, 'printer:updated', pPayload);
        this.emitToStore(storeId, 'printers_updated', pPayload);
        this.emitToStore(storeId, 'hardware_scan_completed', pPayload);
      };
      socket.on('scan_completed', handleScanCompleted);
      socket.on('hardware_ready', handleScanCompleted);

      socket.on('printer_added', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        const addPayload = {
          type: 'ADDED',
          printer: data?.printer,
          timestamp: new Date().toISOString()
        };
        this.emitToStore(storeId, 'printer:added', addPayload);
        this.emitToStore(storeId, 'printer:status', { ...addPayload, status: 'ONLINE' });
        this.emitToStore(storeId, 'printer_status_changed', addPayload);
        this.emitToStore(storeId, 'notification:new', {
          type: 'success',
          title: 'Printer Connected',
          message: `Printer ${data?.printer?.name || 'Device'} is now online.`,
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

      socket.on('printer_removed', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        const remPayload = {
          type: 'REMOVED',
          printerName: data?.printerName,
          timestamp: new Date().toISOString()
        };
        this.emitToStore(storeId, 'printer:removed', remPayload);
        this.emitToStore(storeId, 'printer:status', { ...remPayload, status: 'OFFLINE' });
        this.emitToStore(storeId, 'printer_status_changed', remPayload);
        this.emitToStore(storeId, 'notification:new', {
          type: 'warning',
          title: 'Printer Offline',
          message: `Printer ${data?.printerName || 'Device'} was disconnected.`,
          timestamp: new Date().toISOString()
        });
        this.emitToStore(storeId, 'notification', {
          type: 'warning',
          title: 'Printer Offline',
          message: `Printer ${data?.printerName || 'Device'} was disconnected.`,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('printer_updated', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'printer:updated', data);
        this.emitToStore(storeId, 'printers_updated', data);
      });

      socket.on('paper_low', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        const notif = {
          type: 'warning',
          title: 'Paper Low',
          message: `Printer ${data?.printerName || ''} paper level is low.`,
          timestamp: new Date().toISOString()
        };
        this.emitToStore(storeId, 'notification:new', notif);
        this.emitToStore(storeId, 'notification', notif);
      });
      socket.on('paper_empty', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        const notif = {
          type: 'error',
          title: 'Paper Empty',
          message: `Printer ${data?.printerName || ''} is out of paper.`,
          timestamp: new Date().toISOString()
        };
        this.emitToStore(storeId, 'notification:new', notif);
        this.emitToStore(storeId, 'notification', notif);
      });

      socket.on('toner_low', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        const notif = {
          type: 'warning',
          title: 'Toner Low',
          message: `Printer ${data?.printerName || ''} toner is low.`,
          timestamp: new Date().toISOString()
        };
        this.emitToStore(storeId, 'notification:new', notif);
        this.emitToStore(storeId, 'notification', notif);
      });

      socket.on('queue_changed', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'queue:status', data);
        this.emitToStore(storeId, 'queue_changed', data);
      });

      socket.on('host_restart', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        this.emitToStore(storeId, 'connector_reconnecting', {
          connectorId: data?.connectorId,
          message: 'Host service restarting...',
          timestamp: new Date().toISOString()
        });
      });

      socket.on('internet_lost', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        const dPayload = {
          reason: 'Internet Lost',
          status: 'OFFLINE',
          timestamp: new Date().toISOString()
        };
        this.emitToStore(storeId, 'connector:disconnected', dPayload);
        this.emitToStore(storeId, 'connector_disconnected', dPayload);
      });
      socket.on('internet_restored', (data: any) => {
        const storeId = data?.storeId || (socket as any).storeId || 'default';
        const cPayload = {
          status: 'ONLINE',
          timestamp: new Date().toISOString()
        };
        this.emitToStore(storeId, 'connector:connected', cPayload);
        this.emitToStore(storeId, 'connector_connected', cPayload);
      });

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

      socket.on('connector_status', (data: { status: string; state?: string; connectorId?: string; storeId?: string }) => {
        const storeId = data.storeId || (socket as any).storeId || 'default';
        const payload = {
          ...data,
          connectorId: data.connectorId || (socket as any).connectorId,
          timestamp: new Date().toISOString()
        };
        this.emitToStore(storeId, 'connector:updated', payload);
        this.emitToStore(storeId, 'connector_status', payload);
      });

      socket.on('printer_notification', (data: { type: string; title: string; message: string; storeId?: string }) => {
        const storeId = data.storeId || (socket as any).storeId || 'default';
        const notif = {
          ...data,
          timestamp: new Date().toISOString()
        };
        this.emitToStore(storeId, 'notification:new', notif);
        this.emitToStore(storeId, 'printer_notification', notif);
      });

      
      // -------------------------------------------------------------
      // Job Lifecycle & Automatic Order Completion Handlers
      // -------------------------------------------------------------
      socket.on('job_status_update', async (data: any) => {
        try {
          const { PrintJobModel } = await import('../models/printJob.model');
          const mongoose = await import('mongoose');
          const jobId = data?.jobId || data?.id;
          if (!jobId) return;

          const isObjectId = mongoose.Types.ObjectId.isValid(jobId);
          const query: any = isObjectId ? { _id: new mongoose.Types.ObjectId(jobId) } : { jobNumber: jobId };

          const status = String(data?.status || '').toUpperCase();
          const updateFields: any = {};

          if (status === 'COMPLETED') {
            updateFields.status = 'Completed';
            updateFields.completedAt = new Date();
          } else if (status === 'PRINTING') {
            updateFields.status = 'Printing';
            if (!updateFields.startedAt) updateFields.startedAt = new Date();
          } else if (status === 'FAILED' || status === 'ERROR') {
            updateFields.status = 'Failed';
          } else if (status === 'CANCELLED') {
            updateFields.status = 'Cancelled';
          }

          const updatedJob = await PrintJobModel.findOneAndUpdate(query, { $set: updateFields }, { new: true }).lean();
          if (!updatedJob) return;

          const sId = String(updatedJob.storeId || (socket as any).storeId || 'default');
          const jId = String(updatedJob._id);
          const jobObj = updatedJob;

          const payload = {
            jobId: jId,
            orderId: jId,
            jobNumber: updatedJob.jobNumber,
            storeId: sId,
            status: updatedJob.status,
            job: jobObj,
            completedAt: updatedJob.completedAt,
            timestamp: new Date().toISOString()
          };

          if (status === 'COMPLETED') {
            this.emitToStore(sId, 'order_completed', payload);
            this.emitToStore(sId, 'queue:completed', payload);
            this.emitToStore(sId, 'queue_changed', { storeId: sId, action: 'STATUS_UPDATED', jobId: jId });
            this.emitToStore(sId, 'dashboard_updated', { storeId: sId });
            this.emitToStore(sId, 'PRINT_JOB_STATUS_CHANGED', { jobId: jId, status: 'Completed', job: jobObj });

            this.emitToJob(jId, 'order_completed', payload);
            this.emitToJob(jId, 'queue:completed', payload);
            this.emitToJob(jId, 'PRINT_JOB_STATUS_CHANGED', { jobId: jId, status: 'Completed', job: jobObj });
            this.emitToJob(jId, 'job_status_update', { jobId: jId, status: 'COMPLETED', job: jobObj });

            logger.info(`[Order Complete] Job ${updatedJob.jobNumber} (${jId}) automatically completed by Desktop Connector`);
          } else if (status === 'PRINTING') {
            this.emitToStore(sId, 'queue:started', payload);
            this.emitToStore(sId, 'queue_changed', { storeId: sId, action: 'STATUS_UPDATED', jobId: jId });
            this.emitToStore(sId, 'PRINT_JOB_STATUS_CHANGED', { jobId: jId, status: 'Printing', job: jobObj });

            this.emitToJob(jId, 'queue:started', payload);
            this.emitToJob(jId, 'PRINT_JOB_STATUS_CHANGED', { jobId: jId, status: 'Printing', job: jobObj });
          } else if (status === 'FAILED' || status === 'ERROR') {
            this.emitToStore(sId, 'queue:failed', payload);
            this.emitToStore(sId, 'PRINT_JOB_STATUS_CHANGED', { jobId: jId, status: 'Failed', job: jobObj });

            this.emitToJob(jId, 'queue:failed', payload);
            this.emitToJob(jId, 'PRINT_JOB_STATUS_CHANGED', { jobId: jId, status: 'Failed', job: jobObj });
          }
        } catch (err) {
          logger.error('Error handling job_status_update:', err);
        }
      });

      socket.on('job_completed', async (data: any) => {
        try {
          const { PrintJobModel } = await import('../models/printJob.model');
          const mongoose = await import('mongoose');
          const jobId = data?.jobId || data?.id;
          if (!jobId) return;

          const isObjectId = mongoose.Types.ObjectId.isValid(jobId);
          const query: any = isObjectId ? { _id: new mongoose.Types.ObjectId(jobId) } : { jobNumber: jobId };

          const updatedJob = await PrintJobModel.findOneAndUpdate(
            query,
            { $set: { status: 'Completed', completedAt: new Date() } },
            { new: true }
          ).lean();

          if (!updatedJob) return;

          const sId = String(updatedJob.storeId || (socket as any).storeId || 'default');
          const jId = String(updatedJob._id);
          const payload = {
            jobId: jId,
            orderId: jId,
            jobNumber: updatedJob.jobNumber,
            storeId: sId,
            status: 'Completed',
            job: updatedJob,
            completedAt: updatedJob.completedAt,
            timestamp: new Date().toISOString()
          };

          this.emitToStore(sId, 'order_completed', payload);
          this.emitToStore(sId, 'queue:completed', payload);
          this.emitToStore(sId, 'queue_changed', { storeId: sId, action: 'STATUS_UPDATED', jobId: jId });
          this.emitToStore(sId, 'dashboard_updated', { storeId: sId });
          this.emitToStore(sId, 'PRINT_JOB_STATUS_CHANGED', { jobId: jId, status: 'Completed', job: updatedJob });

          this.emitToJob(jId, 'order_completed', payload);
          this.emitToJob(jId, 'queue:completed', payload);
          this.emitToJob(jId, 'PRINT_JOB_STATUS_CHANGED', { jobId: jId, status: 'Completed', job: updatedJob });
          this.emitToJob(jId, 'job_status_update', { jobId: jId, status: 'COMPLETED', job: updatedJob });

          logger.info(`[Order Complete] Job ${updatedJob.jobNumber} (${jId}) automatically marked COMPLETED via job_completed event`);
        } catch (err) {
          logger.error('Error handling job_completed:', err);
        }
      });

      socket.on('disconnect', (reason) => {
        const connectorId = (socket as any).connectorId;
        const storeId = (socket as any).storeId;
        logger.info(`[Socket] 🔌 Client disconnected: ${socket.id} (connector: ${connectorId || 'none'}, store: ${storeId || 'none'}, reason: ${reason})`);
      });
    });

    this.isInitialized = true;
    runtimeService.setSocketServer(this.io);
    logger.info('[Socket] 🚀 WebSocket & Socket.io server initialized successfully');
    return this.io;
  }

  public emitToStore(storeId: string, event: string, data: any): void {
    if (this.io) {
      logger.info(`[Socket] 📡 Emitting event "${event}" to store:${storeId} and admin`);
      this.io.to(`store:${storeId}`).emit(event, data);
      this.io.to('admin').emit(event, data);
    }
  }

  public emitToJob(jobId: string, event: string, data: any): void {
    if (this.io) {
      logger.info(`[Socket] 📄 Emitting event "${event}" to job:${jobId}`);
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

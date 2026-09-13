import { ConnectorRegistryRecord, ConnectionState, RemoteCommandPayload, RemoteCommandType } from './connector.types';
import { socketManager } from '../../socket';
import { logger } from '../../utils';
import { HostModel } from '../../models/host.model';
import { PrinterModel } from '../../models/printer.model';
import { ConnectorModel } from '../../models/connector.model';
import mongoose from 'mongoose';

class ConnectorRegistryService {
  private registry: Map<string, ConnectorRegistryRecord> = new Map();

  constructor() {
    this.startLivenessChecker();
  }

  private startLivenessChecker(): void {
    setInterval(async () => {
      try {
        const threshold = new Date(Date.now() - 35000);
        const timedOutConnectors = await ConnectorModel.find({
          status: 'ONLINE',
          lastHeartbeat: { $lt: threshold }
        });

        for (const conn of timedOutConnectors) {
          conn.status = 'OFFLINE';
          conn.state = 'OFFLINE';
          await conn.save();

          logger.warn(`⏰ Connector ${conn.connectorId} (store: ${conn.storeId}) marked OFFLINE due to heartbeat timeout (>35s)`);

          socketManager.emitToStore(conn.storeId.toString(), 'connector:disconnected', { connectorId: conn.connectorId, storeId: conn.storeId.toString(), reason: 'Heartbeat timeout (>35s)', timestamp: new Date().toISOString() });
          socketManager.emitToStore(conn.storeId.toString(), 'connector_disconnected', {
            connectorId: conn.connectorId,
            storeId: conn.storeId.toString(),
            reason: 'Heartbeat timeout (>35s)',
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        // quiet catch on db connection or shutdown
      }
    }, 5000);
  }

  /**
   * Registers or updates a Desktop Connector in the Backend registry
   */
  public async registerConnector(data: {
    connectorId: string;
    storeId: string;
    hostname: string;
    machineId: string;
    version: string;
    driverVersion?: string;
    ipAddress?: string;
    authenticated?: boolean;
  }): Promise<ConnectorRegistryRecord> {
    const existing = this.registry.get(data.connectorId);
    const record: ConnectorRegistryRecord = {
      connectorId: data.connectorId,
      storeId: data.storeId || 'default',
      hostname: data.hostname,
      machineId: data.machineId,
      version: data.version || '1.0.0',
      status: 'ONLINE',
      state: 'CONNECTED',
      socketConnected: true,
      lastHeartbeat: new Date(),
      lastSeen: new Date(),
      health: existing?.health || {
        hasInternet: true,
        printSpoolerStatus: 'Running'
      },
      connectedPrinters: existing?.connectedPrinters || 0,
      physicalPrinters: existing?.physicalPrinters || [],
      driverVersion: data.driverVersion || 'Windows Print Spooler v4',
      hostRunning: true,
      authenticated: data.authenticated !== undefined ? data.authenticated : true,
      assignedPrinter: existing?.assignedPrinter || null,
      notifications: existing?.notifications || []
    };

    this.registry.set(data.connectorId, record);

    // Persist to MongoDB HostModel if valid ObjectId
    try {
      if (mongoose.Types.ObjectId.isValid(record.storeId)) {
        await HostModel.findOneAndUpdate(
          { storeId: record.storeId, hostId: record.connectorId },
          {
            deviceName: record.hostname,
            os: 'Windows',
            hostVersion: record.version,
            ipAddress: data.ipAddress,
            status: 'ONLINE',
            lastHeartbeat: new Date()
          },
          { upsert: true, new: true }
        );
      }
    } catch (err) {
      logger.warn('Failed to upsert HostModel in database:', err);
    }

    // Broadcast to Store Dashboard & Admin
    socketManager.emitToStore(record.storeId, 'connector:connected', { connectorId: record.connectorId, storeId: record.storeId, hostname: record.hostname, status: 'ONLINE', state: 'CONNECTED', timestamp: new Date().toISOString() });
    socketManager.emitToStore(record.storeId, 'connector_connected', {
      connectorId: record.connectorId,
      storeId: record.storeId,
      hostname: record.hostname,
      status: 'ONLINE',
      state: 'CONNECTED',
      timestamp: new Date().toISOString()
    });

    socketManager.emitToStore(record.storeId, 'connector_authenticated', {
      connectorId: record.connectorId,
      authenticated: true,
      timestamp: new Date().toISOString()
    });

    return record;
  }

  /**
   * Updates connector state (e.g. SCANNING_PRINTERS, PRINTERS_READY, RECONNECTING, OFFLINE)
   */
  public updateState(connectorId: string, state: ConnectionState, meta?: Partial<ConnectorRegistryRecord>): void {
    const record = this.registry.get(connectorId);
    if (!record) return;

    record.state = state;
    record.lastSeen = new Date();
    if (meta) {
      Object.assign(record, meta);
    }

    if (state === 'OFFLINE' || state === 'ERROR') {
      record.status = 'OFFLINE';
      record.socketConnected = false;
      record.hostRunning = false;
    } else if (state === 'CONNECTED' || state === 'READY') {
      record.status = 'ONLINE';
      record.socketConnected = true;
      record.hostRunning = true;
    }

    // Broadcast state transition to Store Dashboard
    socketManager.emitToStore(record.storeId, 'connector_status_changed', {
      connectorId: record.connectorId,
      state: record.state,
      status: record.status,
      timestamp: new Date().toISOString()
    });

    if (state === 'OFFLINE') {
      socketManager.emitToStore(record.storeId, 'connector_disconnected', {
        connectorId: record.connectorId,
        reason: 'Host connection dropped',
        timestamp: new Date().toISOString()
      });
    } else if (state === 'RECONNECTING') {
      socketManager.emitToStore(record.storeId, 'connector_reconnecting', {
        connectorId: record.connectorId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Updates hardware printer inventory received from connector
   */
  public async updatePrinters(connectorId: string, printers: any[]): Promise<void> {
    const record = this.registry.get(connectorId);
    if (record) {
      record.physicalPrinters = printers;
      record.connectedPrinters = printers.length;
      record.state = 'READY';
      record.lastSeen = new Date();

      socketManager.emitToStore(record.storeId, 'printer:updated', { connectorId, printers, count: printers.length, timestamp: new Date().toISOString() });
      socketManager.emitToStore(record.storeId, 'printers_updated', {
        connectorId,
        printers,
        count: printers.length,
        timestamp: new Date().toISOString()
      });

      socketManager.emitToStore(record.storeId, 'hardware_scan_completed', {
        connectorId,
        count: printers.length,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Heartbeat ping from connector
   */
  public recordHeartbeat(connectorId: string, telemetry?: any): void {
    const record = this.registry.get(connectorId);
    if (!record) return;

    record.lastHeartbeat = new Date();
    record.lastSeen = new Date();
    record.socketConnected = true;
    if (telemetry) {
      record.health = {
        cpuUsagePercent: telemetry.cpuUsagePercent,
        memoryMB: telemetry.memory?.processRssMB,
        printSpoolerStatus: telemetry.printSpoolerStatus || 'Running',
        hasInternet: telemetry.hasInternet !== undefined ? telemetry.hasInternet : true,
        latencyMs: telemetry.backendLatencyMs
      };
    }

    socketManager.emitToStore(record.storeId, 'heartbeat', {
      connectorId,
      timestamp: new Date().toISOString(),
      health: record.health
    });
  }

  /**
   * Dispatch a remote command from Admin/Dashboard to Desktop Connector
   */
  public dispatchCommand(command: RemoteCommandType, storeId: string, params?: Record<string, any>): RemoteCommandPayload {
    const commandPayload: RemoteCommandPayload = {
      commandId: `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      command,
      params,
      issuedAt: new Date().toISOString()
    };

    // Forward command to connectors room and target store room
    socketManager.emitToStore(storeId, 'remote_command', commandPayload);

    // Also forward specific command names directly for native compatibility
    socketManager.emitToStore(storeId, command, params || {});

    logger.info(`📡 Dispatched remote command: ${command} to store: ${storeId}`);
    return commandPayload;
  }

  public getConnector(connectorId: string): ConnectorRegistryRecord | undefined {
    return this.registry.get(connectorId);
  }

  public getStoreConnector(storeId: string): ConnectorRegistryRecord | undefined {
    for (const record of this.registry.values()) {
      if (record.storeId === storeId) return record;
    }
    return undefined;
  }

  public getAll(): ConnectorRegistryRecord[] {
    return Array.from(this.registry.values());
  }

  public unregisterConnector(connectorId: string): void {
    this.registry.delete(connectorId);
  }
}

export const connectorRegistry = new ConnectorRegistryService();
export default connectorRegistry;

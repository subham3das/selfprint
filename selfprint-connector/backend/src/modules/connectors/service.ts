import crypto from 'crypto';
import { ConnectorModel } from './model';
import { connectorAuditService } from './audit.service';
import {
  RegisterConnectorDto,
  RegisterResponseDto,
  HeartbeatDto,
  PrinterSyncDto,
  ConnectorDocument,
  ConnectorQueryFilter,
  ConnectorStatus,
  PrinterDeviceDto,
  DiagnosticReport,
  QueuedCommand,
  StoreNotificationPayload
} from './types';

// In-memory fallback repository for standalone testing or non-Mongo environments
const inMemoryStore: Map<string, ConnectorDocument> = new Map();

// Pending commands queue for disconnected/reconnecting connectors
const pendingCommandsQueue: Map<string, QueuedCommand[]> = new Map();

export class ConnectorService {
  private jwtSecret: string;
  private wsBaseUrl: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || process.env.CONNECTOR_JWT_SECRET || 'selfprint-super-secret-connector-key-2026';
    this.wsBaseUrl = process.env.WEBSOCKET_URL || process.env.BACKEND_URL || 'http://localhost:3000';
  }

  /**
   * Generates a signed HMAC-SHA256 JWT device token.
   */
  public generateDeviceToken(connectorId: string, machineId: string): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        sub: connectorId,
        machineId,
        type: 'connector_device',
        iat: Math.floor(Date.now() / 1000)
      })
    ).toString('base64url');

    const signature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    return `${header}.${payload}.${signature}`;
  }

  /**
   * Validates a device token signature and returns the payload claims.
   */
  public verifyDeviceToken(token: string): { isValid: boolean; connectorId?: string; machineId?: string } {
    try {
      if (!token || typeof token !== 'string') return { isValid: false };
      const parts = token.split('.');
      if (parts.length !== 3) return { isValid: false };

      const [header, payload, signature] = parts;
      const expectedSignature = crypto
        .createHmac('sha256', this.jwtSecret)
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        return { isValid: false };
      }

      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      if (decodedPayload.type !== 'connector_device' || !decodedPayload.sub) {
        return { isValid: false };
      }

      return {
        isValid: true,
        connectorId: decodedPayload.sub,
        machineId: decodedPayload.machineId
      };
    } catch {
      return { isValid: false };
    }
  }

  /**
   * Registration API: POST /api/v1/connectors/register
   */
  public async registerConnector(dto: RegisterConnectorDto, clientIp = '127.0.0.1'): Promise<RegisterResponseDto> {
    const deviceToken = this.generateDeviceToken(dto.connectorId, dto.machineId);
    const deviceTokenHash = crypto.createHash('sha256').update(deviceToken).digest('hex');

    const updateDoc: Partial<ConnectorDocument> = {
      connectorId: dto.connectorId,
      machineId: dto.machineId,
      deviceTokenHash,
      hostname: dto.hostname,
      windowsUser: dto.windowsUser || 'SYSTEM',
      osVersion: dto.osVersion,
      connectorVersion: dto.connectorVersion,
      currentIp: clientIp,
      lastHeartbeat: new Date(),
      status: 'ONLINE',
      lastSeen: new Date(),
      isActive: true
    };

    if (ConnectorModel) {
      const existing = await ConnectorModel.findOne({ connectorId: dto.connectorId });
      if (existing) {
        await ConnectorModel.updateOne({ connectorId: dto.connectorId }, { $set: updateDoc });
        await connectorAuditService.log(
          dto.connectorId,
          'REGISTRATION',
          { action: 'UPDATE_REGISTRATION', hostname: dto.hostname, version: dto.connectorVersion },
          'CONNECTOR',
          clientIp
        );
      } else {
        await ConnectorModel.create({
          ...updateDoc,
          connectedPrinters: [],
          storeId: null,
          cpu: 0,
          ram: { totalMB: 0, freeMB: 0, processMB: 0 },
          disk: { freeGB: 0, totalGB: 0 },
          internet: true,
          uptime: 0,
          latency: null,
          printerCount: 0,
          activeQueueSize: 0,
          spoolerStatus: 'Running'
        });
        await connectorAuditService.log(
          dto.connectorId,
          'REGISTRATION',
          { action: 'NEW_REGISTRATION', hostname: dto.hostname, version: dto.connectorVersion },
          'CONNECTOR',
          clientIp
        );
      }
    } else {
      const existing = inMemoryStore.get(dto.connectorId);
      inMemoryStore.set(dto.connectorId, {
        ...(existing || {}),
        ...updateDoc,
        connectedPrinters: existing?.connectedPrinters || [],
        storeId: existing?.storeId || null,
        cpu: existing?.cpu || 0,
        ram: existing?.ram || { totalMB: 0, freeMB: 0, processMB: 0 },
        disk: existing?.disk || { freeGB: 0, totalGB: 0 },
        internet: true,
        uptime: existing?.uptime || 0,
        latency: null,
        printerCount: existing?.printerCount || 0,
        activeQueueSize: 0,
        spoolerStatus: 'Running'
      } as ConnectorDocument);

      await connectorAuditService.log(
        dto.connectorId,
        'REGISTRATION',
        { action: existing ? 'UPDATE_REGISTRATION' : 'NEW_REGISTRATION', hostname: dto.hostname },
        'CONNECTOR',
        clientIp
      );
    }

    return {
      success: true,
      message: 'Connector registered and authenticated successfully.',
      data: {
        deviceToken,
        connectorId: dto.connectorId,
        machineId: dto.machineId,
        heartbeatInterval: 15000,
        scanInterval: 30000,
        websocketURL: this.wsBaseUrl
      }
    };
  }

  /**
   * Heartbeat API: POST /api/v1/connectors/heartbeat
   */
  public async processHeartbeat(dto: HeartbeatDto, clientIp?: string): Promise<{ success: boolean; connector?: ConnectorDocument | null }> {
    const updates: Partial<ConnectorDocument> = {
      lastHeartbeat: new Date(),
      lastSeen: new Date(),
      status: 'ONLINE',
      uptime: dto.uptime,
      printerCount: dto.printerCount,
      connectorVersion: dto.connectorVersion,
      cpu: dto.cpuUsage || 0,
      spoolerStatus: dto.spoolerStatus || 'Running',
      activeQueueSize: dto.activeQueueSize || 0
    };

    if (dto.memoryUsage) {
      updates.ram = dto.memoryUsage;
    }
    if (dto.diskUsage) {
      updates.disk = dto.diskUsage;
    }
    if (clientIp) {
      updates.currentIp = clientIp;
    }

    let updatedDoc: ConnectorDocument | null = null;

    if (ConnectorModel) {
      updatedDoc = await ConnectorModel.findOneAndUpdate(
        { connectorId: dto.connectorId, isActive: true },
        { $set: updates },
        { new: true }
      ).lean();
    } else {
      const existing = inMemoryStore.get(dto.connectorId);
      if (existing && existing.isActive) {
        updatedDoc = { ...existing, ...updates } as ConnectorDocument;
        inMemoryStore.set(dto.connectorId, updatedDoc);
      }
    }

    return { success: Boolean(updatedDoc), connector: updatedDoc };
  }

  /**
   * Printer Sync API: POST /api/v1/connectors/printers/sync
   */
  public async syncPrinters(dto: PrinterSyncDto): Promise<{ success: boolean; count: number; connector?: ConnectorDocument | null }> {
    const uniqueMap = new Map<string, PrinterDeviceDto>();
    for (const p of dto.printers) {
      if (p && p.id) {
        uniqueMap.set(p.id, p);
      }
    }
    const sanitizedPrinters = Array.from(uniqueMap.values());

    let updatedDoc: ConnectorDocument | null = null;

    if (ConnectorModel) {
      updatedDoc = await ConnectorModel.findOneAndUpdate(
        { connectorId: dto.connectorId, isActive: true },
        {
          $set: {
            connectedPrinters: sanitizedPrinters,
            printerCount: sanitizedPrinters.length,
            lastSeen: new Date(),
            status: 'ONLINE'
          }
        },
        { new: true }
      ).lean();
    } else {
      const existing = inMemoryStore.get(dto.connectorId);
      if (existing && existing.isActive) {
        existing.connectedPrinters = sanitizedPrinters;
        existing.printerCount = sanitizedPrinters.length;
        existing.lastSeen = new Date();
        existing.status = 'ONLINE';
        inMemoryStore.set(dto.connectorId, existing);
        updatedDoc = existing;
      }
    }

    return { success: Boolean(updatedDoc), count: sanitizedPrinters.length, connector: updatedDoc };
  }

  /**
   * Store Assignment: PATCH /api/v1/connectors/:id/store
   */
  public async assignStore(connectorId: string, storeId: string | null, performedBy = 'ADMIN'): Promise<boolean> {
    const action = storeId ? 'ASSIGNMENT' : 'UNASSIGNMENT';
    if (ConnectorModel) {
      const res = await ConnectorModel.updateOne({ connectorId }, { $set: { storeId } });
      if (res.matchedCount > 0) {
        await connectorAuditService.log(connectorId, action, { storeId }, performedBy);
        return true;
      }
      return false;
    } else {
      const c = inMemoryStore.get(connectorId);
      if (c) {
        c.storeId = storeId;
        await connectorAuditService.log(connectorId, action, { storeId }, performedBy);
        return true;
      }
      return false;
    }
  }

  /**
   * Status Override API: PATCH /api/v1/connectors/:id/status
   */
  public async updateStatus(connectorId: string, status: ConnectorStatus, performedBy = 'ADMIN'): Promise<boolean> {
    if (ConnectorModel) {
      const res = await ConnectorModel.updateOne({ connectorId }, { $set: { status } });
      if (res.matchedCount > 0) {
        await connectorAuditService.log(connectorId, 'STATUS_CHANGE', { newStatus: status }, performedBy);
        return true;
      }
      return false;
    } else {
      const c = inMemoryStore.get(connectorId);
      if (c) {
        c.status = status;
        await connectorAuditService.log(connectorId, 'STATUS_CHANGE', { newStatus: status }, performedBy);
        return true;
      }
      return false;
    }
  }

  /**
   * Delete / Disable Connector: DELETE /api/v1/connectors/:id
   */
  public async deleteConnector(connectorId: string, performedBy = 'ADMIN'): Promise<boolean> {
    if (ConnectorModel) {
      const res = await ConnectorModel.updateOne(
        { connectorId },
        { $set: { isActive: false, status: 'OFFLINE', storeId: null } }
      );
      if (res.matchedCount > 0) {
        await connectorAuditService.log(connectorId, 'DELETION', { status: 'DEACTIVATED' }, performedBy);
        return true;
      }
      return false;
    } else {
      const c = inMemoryStore.get(connectorId);
      if (c) {
        c.isActive = false;
        c.status = 'OFFLINE';
        c.storeId = null;
        await connectorAuditService.log(connectorId, 'DELETION', { status: 'DEACTIVATED' }, performedBy);
        return true;
      }
      return false;
    }
  }

  /**
   * List Connectors with Filtering
   */
  public async listConnectors(filter: ConnectorQueryFilter = {}): Promise<{ total: number; connectors: ConnectorDocument[] }> {
    if (ConnectorModel) {
      const query: any = { isActive: true };
      if (filter.status) query.status = filter.status;
      if (filter.storeId) query.storeId = filter.storeId;
      if (filter.search) {
        query.$or = [
          { hostname: { $regex: filter.search, $options: 'i' } },
          { connectorId: { $regex: filter.search, $options: 'i' } },
          { currentIp: { $regex: filter.search, $options: 'i' } }
        ];
      }

      const total = await ConnectorModel.countDocuments(query);
      const page = filter.page || 1;
      const limit = filter.limit || 50;
      const connectors = await ConnectorModel.find(query)
        .sort({ status: 1, lastHeartbeat: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return { total, connectors };
    } else {
      let list = Array.from(inMemoryStore.values()).filter((c) => c.isActive);
      if (filter.status) list = list.filter((c) => c.status === filter.status);
      if (filter.storeId) list = list.filter((c) => c.storeId === filter.storeId);
      if (filter.search) {
        const s = filter.search.toLowerCase();
        list = list.filter((c) => c.hostname.toLowerCase().includes(s) || c.connectorId.includes(s) || c.currentIp.includes(s));
      }
      return { total: list.length, connectors: list };
    }
  }

  /**
   * Get Connector by ID
   */
  public async getConnectorById(id: string): Promise<ConnectorDocument | null> {
    if (ConnectorModel) {
      return await ConnectorModel.findOne({
        $or: [{ connectorId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
        isActive: true
      }).lean();
    } else {
      const c = inMemoryStore.get(id);
      return c && c.isActive ? c : null;
    }
  }

  /**
   * Get Connected Printers for a Connector
   */
  public async getConnectorPrinters(id: string): Promise<PrinterDeviceDto[]> {
    const connector = await this.getConnectorById(id);
    return connector ? connector.connectedPrinters : [];
  }

  /**
   * Generates a complete diagnostic report for a connector
   */
  public async generateDiagnosticReport(connectorId: string, performedBy = 'STORE_ADMIN'): Promise<DiagnosticReport | null> {
    const connector = await this.getConnectorById(connectorId);
    if (!connector) return null;

    await connectorAuditService.log(connectorId, 'DIAGNOSTICS_RUN', { requestedBy: performedBy }, performedBy);

    return {
      connectorId: connector.connectorId,
      machineId: connector.machineId,
      hostname: connector.hostname,
      windowsUser: connector.windowsUser,
      osVersion: connector.osVersion,
      connectorVersion: connector.connectorVersion,
      storeId: connector.storeId,
      status: connector.status,
      lastHeartbeat: connector.lastHeartbeat,
      uptimeSeconds: connector.uptime,
      cpuUsagePercent: connector.cpu,
      memory: {
        totalMB: connector.ram?.totalMB || 0,
        freeMB: connector.ram?.freeMB || 0,
        processRssMB: connector.ram?.processMB || 0
      },
      disk: {
        freeGB: connector.disk?.freeGB || 0,
        totalGB: connector.disk?.totalGB || 0
      },
      spoolerStatus: connector.spoolerStatus || 'Running',
      hasInternet: connector.internet,
      backendLatencyMs: connector.latency,
      printers: connector.connectedPrinters.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        isOnline: p.isOnline,
        jobsWaiting: p.jobsWaiting,
        connectionType: p.connectionType
      })),
      diagnosticTimestamp: new Date().toISOString(),
      generatedBy: performedBy
    };
  }

  /**
   * Queue command when connector is offline
   */
  public queueCommand(cmd: Omit<QueuedCommand, 'id' | 'queuedAt'>): QueuedCommand {
    const queued: QueuedCommand = {
      ...cmd,
      id: `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      queuedAt: new Date()
    };

    const existing = pendingCommandsQueue.get(cmd.connectorId) || [];
    pendingCommandsQueue.set(cmd.connectorId, [...existing, queued]);
    return queued;
  }

  /**
   * Drains pending commands for a reconnected connector
   */
  public drainPendingCommands(connectorId: string): QueuedCommand[] {
    const pending = pendingCommandsQueue.get(connectorId) || [];
    pendingCommandsQueue.delete(connectorId);
    return pending;
  }

  /**
   * Watchdog stale checker
   */
  public async checkStaleConnectors(): Promise<{ modifiedCount: number; offlineConnectors: ConnectorDocument[] }> {
    const threshold = new Date(Date.now() - 60000);
    const offlineList: ConnectorDocument[] = [];

    if (ConnectorModel) {
      const stale = await ConnectorModel.find({
        status: 'ONLINE',
        isActive: true,
        lastHeartbeat: { $lt: threshold }
      }).lean();

      if (stale.length > 0) {
        const ids = stale.map((s: any) => s.connectorId);
        await ConnectorModel.updateMany(
          { connectorId: { $in: ids } },
          { $set: { status: 'OFFLINE' } }
        );

        for (const s of stale) {
          await connectorAuditService.log(s.connectorId, 'OFFLINE', { reason: 'HEARTBEAT_TIMEOUT_60S' }, 'WATCHDOG');
          offlineList.push(s);
        }
      }

      return { modifiedCount: stale.length, offlineConnectors: offlineList };
    } else {
      let count = 0;
      for (const [id, c] of inMemoryStore.entries()) {
        if (c.status === 'ONLINE' && c.isActive && new Date(c.lastHeartbeat).getTime() < threshold.getTime()) {
          c.status = 'OFFLINE';
          count++;
          offlineList.push(c);
          connectorAuditService.log(id, 'OFFLINE', { reason: 'HEARTBEAT_TIMEOUT_60S' }, 'WATCHDOG');
        }
      }
      return { modifiedCount: count, offlineConnectors: offlineList };
    }
  }
}

export const connectorService = new ConnectorService();

import { Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { PairingCodeModel } from '../../models/pairingCode.model';
import { ConnectorModel } from '../../models/connector.model';
import { StoreModel } from '../../models/store.model';
import { socketManager } from '../../socket';
import { connectorRegistry } from './connector.service';
import { logger } from '../../utils';
import { jwtUtils } from '../../utils/jwt';

export class ConnectorController {
  /**
   * Generates a 6-character uppercase pairing code valid for 10 minutes.
   * POST /api/v1/connectors/pairing-code
   */
  public async generatePairingCode(req: Request, res: Response): Promise<void> {
    try {
      const storeId = req.body.storeId || (req as any).user?.storeId || (req as any).store?.id;

      if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
        res.status(400).json({
          success: false,
          error: 'Valid Store ID is required to generate a pairing code.'
        });
        return;
      }

      // Invalidate existing unused pairing codes for this store
      await PairingCodeModel.updateMany(
        { storeId, used: false },
        { $set: { used: true } }
      );

      // Generate random 6-character alphanumeric code e.g. SP-48KD91
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let randomCode = '';
      const bytes = crypto.randomBytes(6);
      for (let i = 0; i < 6; i++) {
        randomCode += chars[bytes[i] % chars.length];
      }
      const store = await StoreModel.findById(storeId);
      const pairingCode = `SP-${randomCode}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const record = await PairingCodeModel.create({
        code: pairingCode,
        pairingCode,
        storeId,
        storeName: store?.name || 'SelfPrint Store',
        merchantId: store?._id || null,
        expiresAt,
        used: false
      });

      res.status(201).json({
        success: true,
        code: record.code,
        expiresIn: 600,
        data: {
          code: record.code,
          pairingCode: record.code,
          storeId: record.storeId,
          storeName: record.storeName,
          expiresAt: record.expiresAt,
          expiresInSeconds: 600
        }
      });
    } catch (err: any) {
      logger.error('Error generating pairing code:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to generate pairing code'
      });
    }
  }

  /**
   * Pairs Desktop Connector with Store permanently.
   * POST /api/v1/connectors/pair
   */
  public async pairConnector(req: Request, res: Response): Promise<void> {
    try {
      const {
        pairingCode,
        connectorId,
        machineId,
        hostname,
        version,
        windowsUser,
        os
      } = req.body;

      if (!pairingCode || !connectorId || !machineId) {
        res.status(400).json({
          success: false,
          error: 'pairingCode, connectorId, and machineId are required.'
        });
        return;
      }

      const cleanCode = pairingCode.trim().toUpperCase();
      const codeRecord = await PairingCodeModel.findOne({
        $or: [{ pairingCode: cleanCode }, { code: cleanCode }]
      });

      if (!codeRecord) {
        res.status(400).json({
          success: false,
          error: 'Invalid Code',
          message: 'The pairing code entered does not exist. Please generate a code in the Store Dashboard.'
        });
        return;
      }

      if (codeRecord.used) {
        res.status(400).json({
          success: false,
          error: 'Already Used',
          message: 'This pairing code has already been claimed.'
        });
        return;
      }

      if (new Date(codeRecord.expiresAt).getTime() <= Date.now()) {
        res.status(400).json({
          success: false,
          error: 'Code Expired',
          message: 'This pairing code has expired. Please generate a new code in your Store Dashboard.'
        });
        return;
      }

      const store = await StoreModel.findById(codeRecord.storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          error: 'Store Not Found',
          message: 'The store linked to this pairing code could not be found.'
        });
        return;
      }

      const storeName = store.name || 'SelfPrint Store';
      const storeCode = store.storeCode || '';
      const ownerName = store.ownerName || 'Store Owner';

      // Ownership Protection: connector already paired to another store cannot pair to a new store without unpairing
      const existingConnector = await ConnectorModel.findOne({ connectorId });
      if (
        existingConnector &&
        existingConnector.storeId &&
        existingConnector.storeId.toString() !== codeRecord.storeId.toString()
      ) {
        const ownerStore = await StoreModel.findById(existingConnector.storeId);
        const ownerStoreName = ownerStore?.name || existingConnector.storeName || 'another store';
        logger.warn(
          `🚫 Ownership Conflict: Connector ${connectorId} is already owned by "${ownerStoreName}" (${existingConnector.storeId}). Rejected pairing with Store ${codeRecord.storeId}`
        );
        res.status(403).json({
          success: false,
          code: 'ALREADY_OWNED',
          error: 'Ownership Conflict',
          message: `This connector is already owned by ${ownerStoreName}. Unpair before connecting to another store.`
        });
        return;
      }

      // Generate permanent cryptographic Device Token
      const deviceToken = `dt_${crypto.randomBytes(32).toString('hex')}`;

      // Permanently link connector to store in MongoDB
      const connector = await ConnectorModel.findOneAndUpdate(
        { connectorId },
        {
          connectorId,
          storeId: codeRecord.storeId,
          storeName,
          merchantId: store._id,
          machineId,
          hostname: hostname || 'Host Device',
          windowsUser: windowsUser || 'User',
          os: os || 'Windows',
          version: version || '1.0.0',
          deviceToken,
          status: 'ONLINE',
          state: 'CONNECTED',
          lastHeartbeat: new Date(),
          lastSeen: new Date(),
          pairedAt: new Date(),
          hostRunning: true,
          authenticated: true
        },
        { upsert: true, new: true }
      );

      // Mark pairing code as used and delete it
      codeRecord.used = true;
      codeRecord.connectorId = connectorId;
      await codeRecord.save();
      await PairingCodeModel.deleteOne({ _id: codeRecord._id });

      // Register in memory registry
      await connectorRegistry.registerConnector({
        connectorId,
        storeId: codeRecord.storeId.toString(),
        hostname: connector.hostname,
        machineId: connector.machineId,
        version: connector.version,
        authenticated: true
      });

      // Realtime notification to Store Dashboard room
      socketManager.emitToStore(codeRecord.storeId.toString(), 'connector_paired', {
        connectorId,
        storeId: codeRecord.storeId.toString(),
        storeName,
        storeCode,
        ownerName,
        hostname: connector.hostname,
        timestamp: new Date().toISOString()
      });

      socketManager.emitToStore(codeRecord.storeId.toString(), 'connector_connected', {
        connectorId,
        storeId: codeRecord.storeId.toString(),
        status: 'ONLINE',
        state: 'CONNECTED',
        timestamp: new Date().toISOString()
      });

      logger.info(`🤝 Connector ${connectorId} successfully paired to Store ${codeRecord.storeId} (${storeName})`);

      res.status(200).json({
        success: true,
        deviceToken,
        storeId: codeRecord.storeId,
        storeName,
        storeCode,
        ownerName,
        message: 'Connector paired successfully',
        data: {
          connectorId,
          storeId: codeRecord.storeId,
          storeName,
          storeCode,
          ownerName,
          deviceToken
        }
      });
    } catch (err: any) {
      logger.error('Error pairing connector:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to complete pairing'
      });
    }
  }

  /**
   * Retrieves live connector and heartbeat status for a store.
   * GET /api/v1/connectors/status
   */
  public async getConnectorStatus(req: Request, res: Response): Promise<void> {
    try {
      let storeId = (req.query.storeId as string) || (req.headers['x-store-id'] as string);

      // Attempt to decode storeId from Authorization Bearer token if not explicitly provided
      if (!storeId && req.headers.authorization?.startsWith('Bearer ')) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          const decoded: any = jwtUtils.verifyToken(token);
          storeId = decoded.storeId || decoded.sub || decoded.id;
        } catch {
          // Fallback silently if token is invalid or expired
        }
      }

      if (!storeId) {
        res.status(400).json({
          success: false,
          code: 'STORE_ID_REQUIRED',
          message: 'Store ID is required.'
        });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        res.status(400).json({
          success: false,
          code: 'INVALID_STORE_ID',
          message: 'Valid Store ObjectId is required.'
        });
        return;
      }

      const connector = await ConnectorModel.findOne({ storeId }).sort({ updatedAt: -1 });

      if (!connector) {
        res.status(404).json({
          success: false,
          code: 'CONNECTOR_NOT_PAIRED',
          message: 'No connector is paired with this store.',
          data: {
            paired: false,
            isPaired: false,
            authenticated: false,
            socketConnected: false,
            hostRunning: false,
            deviceTokenValid: false,
            storeId,
            machineName: null,
            physicalPrinterCount: 0,
            connectionState: 'RUNNING_UNPAIRED',
            state: 'NOT_PAIRED',
            status: 'OFFLINE'
          }
        });
        return;
      }

      // Check heartbeat freshness: alive if < 35 seconds (allows grace period for 10s intervals + jitter)
      const diffMs = Date.now() - new Date(connector.lastHeartbeat).getTime();
      const isAlive = diffMs < 35000;
      const effectiveStatus = isAlive ? connector.status : 'OFFLINE';
      const effectiveState = isAlive ? (connector.state || 'READY') : 'OFFLINE';
      const printerCount = connector.connectedPrinters || (connector.physicalPrinters ? connector.physicalPrinters.length : 0);

      // Determine state machine representation
      const connectionState = !isAlive
        ? 'INSTALLED_NOT_RUNNING'
        : effectiveState === 'SCANNING_PRINTERS'
        ? 'SCANNING_PRINTERS'
        : printerCount > 0
        ? 'READY'
        : 'CONNECTED';

      if (!isAlive) {
        res.status(408).json({
          success: false,
          code: 'CONNECTOR_OFFLINE',
          message: 'Connector heartbeat expired.',
          data: {
            paired: true,
            isPaired: true,
            authenticated: false,
            socketConnected: false,
            hostRunning: false,
            deviceTokenValid: Boolean(connector.deviceToken),
            storeId: connector.storeId,
            machineName: connector.hostname,
            physicalPrinterCount: printerCount,
            connectionState,
            lastHeartbeat: connector.lastHeartbeat,
            state: effectiveState,
            printerCount,
            connectorId: connector.connectorId,
            hostname: connector.hostname,
            version: connector.version,
            status: effectiveStatus,
            isAlive: false,
            lastHeartbeatSecondsAgo: Math.round(diffMs / 1000),
            health: connector.health,
            connectedPrinters: connector.connectedPrinters,
            physicalPrinters: connector.physicalPrinters
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        code: 'CONNECTOR_ONLINE',
        message: 'Connector is online and authenticated.',
        data: {
          paired: true,
          isPaired: true,
          authenticated: connector.authenticated ?? true,
          socketConnected: connector.socketConnected ?? true,
          hostRunning: connector.hostRunning ?? true,
          deviceTokenValid: Boolean(connector.deviceToken),
          storeId: connector.storeId,
          machineName: connector.hostname,
          physicalPrinterCount: printerCount,
          connectionState,
          lastHeartbeat: connector.lastHeartbeat,
          state: effectiveState,
          printerCount,
          connectorId: connector.connectorId,
          hostname: connector.hostname,
          version: connector.version,
          status: effectiveStatus,
          isAlive: true,
          lastHeartbeatSecondsAgo: Math.round(diffMs / 1000),
          health: connector.health,
          connectedPrinters: connector.connectedPrinters,
          physicalPrinters: connector.physicalPrinters
        }
      });
    } catch (err: any) {
      logger.error('Error fetching connector status:', err);
      res.status(500).json({
        success: false,
        code: 'BACKEND_ERROR',
        message: 'Failed to fetch connector status'
      });
    }
  }

  /**
   * Ingests 10-second rich telemetry heartbeat from Desktop Connector.
   * POST /api/v1/connectors/heartbeat
   */
  public async recordHeartbeat(req: Request, res: Response): Promise<void> {
    try {
      const {
        deviceToken,
        connectorId,
        storeId,
        socketConnected,
        authenticated,
        hostRunning,
        physicalPrinters,
        physicalPrinterCount,
        machineId,
        version,
        connectorVersion,
        latency,
        state,
        hostState,
        cpu,
        ram,
        disk,
        spooler,
        internet,
        printers,
        timestamp
      } = req.body;

      if (!connectorId && !deviceToken) {
        res.status(400).json({ success: false, error: 'connectorId or deviceToken is required' });
        return;
      }

      const count = physicalPrinters !== undefined 
        ? (typeof physicalPrinters === 'number' ? physicalPrinters : (Array.isArray(physicalPrinters) ? physicalPrinters.length : 0))
        : (physicalPrinterCount !== undefined 
          ? physicalPrinterCount 
          : (Array.isArray(printers) ? printers.length : 0));

      const isHostAlive = hostRunning !== undefined ? hostRunning : (hostState === 'RUNNING' || hostState === true);
      const isAuth = authenticated !== undefined ? authenticated : true;
      const isSocket = socketConnected !== undefined ? socketConnected : true;

      const updateData: any = {
        lastHeartbeat: new Date(),
        lastSeen: new Date(),
        status: 'ONLINE',
        state: state || ((isHostAlive && isAuth && isSocket) ? 'READY' : 'CONNECTED'),
        hostRunning: isHostAlive,
        authenticated: isAuth,
        socketConnected: isSocket,
        version: version || connectorVersion || '1.0.0',
        connectedPrinters: count,
        physicalPrinters: Array.isArray(printers) ? printers : (Array.isArray(physicalPrinters) ? physicalPrinters : count),
        health: {
          cpuUsagePercent: cpu || 0,
          memoryMB: ram?.processRssMB || ram?.usedMB || 0,
          diskGB: disk?.freeGB || 0,
          printSpoolerStatus: spooler || 'Running',
          hasInternet: internet !== undefined ? internet : true,
          latencyMs: latency || null,
          activeQueueSize: 0
        }
      };

      if (machineId) {
        updateData.machineId = machineId;
      }

      const query: any = connectorId ? { connectorId } : { deviceToken };
      if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
        query.storeId = storeId;
      }

      const connector = await ConnectorModel.findOneAndUpdate(
        query,
        { $set: updateData },
        { new: true }
      );

      if (connector) {
        connectorRegistry.recordHeartbeat(connectorId, updateData.health);

        // Broadcast heartbeat event to store room with full fields
        socketManager.emitToStore(connector.storeId.toString(), 'heartbeat', {
          connectorId,
          storeId: connector.storeId.toString(),
          status: 'ONLINE',
          state: updateData.state,
          paired: true,
          authenticated: updateData.authenticated,
          socketConnected: updateData.socketConnected,
          hostRunning: updateData.hostRunning,
          printerCount: count,
          printersCount: count,
          lastHeartbeat: updateData.lastHeartbeat,
          health: updateData.health,
          timestamp: timestamp || new Date().toISOString()
        });

        // If physical printers were provided, also emit printers_updated
        if (printers && Array.isArray(printers)) {
          socketManager.emitToStore(connector.storeId.toString(), 'printers_updated', {
            connectorId,
            printers,
            count: printers.length,
            timestamp: new Date().toISOString()
          });
        }
      }

      res.status(200).json({ success: true, timestamp: new Date().toISOString() });
    } catch (err: any) {
      logger.error('Error handling connector heartbeat:', err);
      res.status(500).json({ success: false, error: 'Failed to record heartbeat' });
    }
  }

  /**
   * Dispatches remote hardware commands to Desktop Connector.
   * POST /api/v1/connectors/command
   */
  public async dispatchRemoteCommand(req: Request, res: Response): Promise<void> {
    try {
      const { command, params } = req.body;
      const storeId = req.body.storeId || (req as any).user?.storeId || (req as any).store?.id;

      if (!command || !storeId) {
        res.status(400).json({
          success: false,
          error: 'command and storeId are required'
        });
        return;
      }

      const connector = await ConnectorModel.findOne({ storeId });
      if (!connector) {
        res.status(404).json({
          success: false,
          error: 'No connector paired with this store'
        });
        return;
      }

      const result = connectorRegistry.dispatchCommand(command, storeId, params);

      res.status(200).json({
        success: true,
        data: result,
        message: `Command ${command} dispatched to connector ${connector.connectorId}`
      });
    } catch (err: any) {
      logger.error('Error dispatching remote command:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to dispatch command'
      });
    }
  }

  /**
   * Verifies a device token on desktop connector startup.
   * POST /api/v1/connectors/verify-token
   */
  public async verifyDeviceToken(req: Request, res: Response): Promise<void> {
    try {
      const { deviceToken } = req.body;
      if (!deviceToken) {
        res.status(400).json({
          success: false,
          valid: false,
          error: 'Device token is required'
        });
        return;
      }

      const connector = await ConnectorModel.findOne({ deviceToken });
      if (!connector) {
        res.status(401).json({
          success: false,
          valid: false,
          error: 'Invalid device token'
        });
        return;
      }

      const store = await StoreModel.findById(connector.storeId);
      if (!store) {
        res.status(404).json({
          success: false,
          valid: false,
          error: 'Associated store not found'
        });
        return;
      }

      // Refresh connector lastSeen on verification
      connector.lastSeen = new Date();
      await connector.save();

      res.status(200).json({
        success: true,
        valid: true,
        data: {
          connectorId: connector.connectorId,
          storeId: store._id.toString(),
          storeName: store.name,
          storeCode: store.storeCode || '',
          ownerName: store.ownerName || '',
          pairedAt: connector.pairedAt,
          status: connector.status
        }
      });
    } catch (err: any) {
      logger.error('Error verifying device token:', err);
      res.status(500).json({ success: false, error: 'Failed to verify device token' });
    }
  }

  /**
   * Unpairs/revokes a connector and resets store status.
   * DELETE /api/v1/connectors/:id
   * DELETE /api/v1/connectors/unpair
   * POST /api/v1/connectors/unpair
   */
  public async unpairConnector(req: Request, res: Response): Promise<void> {
    try {
      const idOrStoreId = req.params.id || req.body.connectorId || req.body.storeId || req.query.storeId;
      const deviceToken = req.body.deviceToken || req.headers['x-device-token'];

      let query: any = {};
      if (idOrStoreId) {
        if (mongoose.Types.ObjectId.isValid(idOrStoreId as string)) {
          query = { $or: [{ _id: idOrStoreId }, { storeId: idOrStoreId }, { connectorId: idOrStoreId }] };
        } else {
          query = { connectorId: idOrStoreId };
        }
      } else if (deviceToken) {
        query = { deviceToken };
      } else {
        res.status(400).json({
          success: false,
          error: 'Connector identifier, Store ID, or Device Token is required'
        });
        return;
      }

      const connector = await ConnectorModel.findOne(query);
      if (!connector) {
        res.status(404).json({
          success: false,
          error: 'Connector not found'
        });
        return;
      }

      const storeIdStr = connector.storeId.toString();
      const connectorId = connector.connectorId;

      // Remove connector record from MongoDB
      await ConnectorModel.deleteOne({ _id: connector._id });

      // Clean memory registry
      connectorRegistry.unregisterConnector(connectorId);

      // Emit realtime events to store room
      socketManager.emitToStore(storeIdStr, 'connector_unpaired', {
        connectorId,
        storeId: storeIdStr,
        timestamp: new Date().toISOString()
      });
      socketManager.emitToStore(storeIdStr, 'connector_disconnected', {
        connectorId,
        storeId: storeIdStr,
        status: 'OFFLINE',
        state: 'NOT_PAIRED',
        timestamp: new Date().toISOString()
      });

      logger.info(`🔌 Connector ${connectorId} successfully unpaired from Store ${storeIdStr}`);

      res.status(200).json({
        success: true,
        message: 'Connector successfully unpaired'
      });
    } catch (err: any) {
      logger.error('Error unpairing connector:', err);
      res.status(500).json({ success: false, error: 'Failed to unpair connector' });
    }
  }

  /**
   * Helper to resolve the electron-builder release directory
   */
  private getReleaseDir(): string {
    const candidates = [
      path.resolve(process.cwd(), '../../selfprint-connector/release'),
      path.resolve(process.cwd(), '../selfprint-connector/release'),
      path.resolve(__dirname, '../../../../selfprint-connector/release'),
      'd:\\project\\SELFPRINT SYSTEM\\selfprint-connector\\release'
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    return candidates[0];
  }

  private findInstallerFile(): { fullPath: string; fileName: string; sizeBytes: number } | null {
    const releaseDir = this.getReleaseDir();
    if (!fs.existsSync(releaseDir)) return null;

    try {
      const files = fs.readdirSync(releaseDir);
      // Prefer Setup exe over portable exe
      const setupFile = files.find(f => f.endsWith('.exe') && f.toLowerCase().includes('setup'))
        || files.find(f => f.endsWith('.exe'));

      if (!setupFile) return null;

      const fullPath = path.join(releaseDir, setupFile);
      const stats = fs.statSync(fullPath);
      return {
        fullPath,
        fileName: setupFile,
        sizeBytes: stats.size
      };
    } catch {
      return null;
    }
  }

  /**
   * GET /api/v1/connectors/installer-info
   * Returns metadata about the latest installer package for the Store Dashboard
   */
  public async getInstallerInfo(req: Request, res: Response): Promise<void> {
    try {
      const installer = this.findInstallerFile();
      if (installer) {
        const sizeMB = (installer.sizeBytes / (1024 * 1024)).toFixed(1);
        res.status(200).json({
          success: true,
          version: '1.0.0',
          fileName: installer.fileName,
          sizeMB: `${sizeMB} MB`,
          sizeBytes: installer.sizeBytes,
          downloadUrl: '/api/v1/connectors/download',
          available: true,
          platform: 'Windows (x64)',
          supportedOs: 'Windows 10 / 11 (64-bit)',
          releasedAt: new Date().toISOString()
        });
      } else {
        res.status(200).json({
          success: true,
          version: '1.0.0',
          fileName: 'SelfPrint-Connector-Setup.exe',
          sizeMB: '85.4 MB',
          sizeBytes: 89548800,
          downloadUrl: '/api/v1/connectors/download',
          available: false,
          platform: 'Windows (x64)',
          supportedOs: 'Windows 10 / 11 (64-bit)',
          message: 'Installer binary compilation in progress'
        });
      }
    } catch (err: any) {
      logger.error('Error getting installer info:', err);
      res.status(500).json({ success: false, error: 'Failed to retrieve installer info' });
    }
  }

  /**
   * GET /api/v1/connectors/download
   * Streams the Windows installer executable directly to the browser
   */
  public async downloadInstaller(req: Request, res: Response): Promise<void> {
    try {
      const installer = this.findInstallerFile();
      if (!installer) {
        res.status(404).json({
          success: false,
          code: 'INSTALLER_NOT_FOUND',
          message: 'Connector setup package is currently being generated. Please build the package or try again shortly.'
        });
        return;
      }

      res.setHeader('Content-Disposition', `attachment; filename="${installer.fileName}"`);
      res.setHeader('Content-Type', 'application/vnd.microsoft.portable-executable');
      res.setHeader('Content-Length', installer.sizeBytes);

      const stream = fs.createReadStream(installer.fullPath);
      stream.pipe(res);
    } catch (err: any) {
      logger.error('Error streaming installer download:', err);
      res.status(500).json({ success: false, error: 'Failed to stream installer package' });
    }
  }
}

export const connectorController = new ConnectorController();
export default connectorController;

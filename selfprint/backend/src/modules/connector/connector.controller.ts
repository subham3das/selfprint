import { runtimeService } from '../../services/runtime.service';
﻿import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { PairingCodeModel } from '../../models/pairingCode.model';
import { ConnectorModel } from '../../models/connector.model';
import { StoreModel } from '../../models/store.model';
import { socketManager } from '../../socket';
import { connectorRegistry } from './connector.service';
import { logger } from '../../utils';
import { jwtUtils } from '../../utils/jwt';
import { githubReleaseService } from '../../services/githubRelease.service';

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

      const store = await StoreModel.findById(storeId);
      if (!store || store.isDeleted || store.status === 'DELETED') {
        res.status(403).json({
          success: false,
          code: 'STORE_DELETED',
          message: 'This store has been deleted by the administrator.'
        });
        return;
      }

      if (store.blocked || store.status === 'BLOCKED') {
        res.status(403).json({
          success: false,
          code: 'STORE_BLOCKED',
          message: 'Your store has been blocked by the administrator. Please contact support.'
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
      const pairingCode = `SP-${randomCode}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const record = await PairingCodeModel.create({
        code: pairingCode,
        pairingCode,
        storeId,
        storeName: store.name || 'SelfPrint Store',
        merchantId: store._id || null,
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
      if (!store || store.isDeleted || store.status === 'DELETED') {
        res.status(403).json({
          success: false,
          code: 'STORE_DELETED',
          error: 'Store Deleted',
          message: 'This store has been deleted by the administrator.'
        });
        return;
      }

      if (store.blocked || store.status === 'BLOCKED') {
        res.status(403).json({
          success: false,
          code: 'STORE_BLOCKED',
          error: 'Store Blocked',
          message: 'Your store has been blocked by the administrator. Please contact support.'
        });
        return;
      }

      const storeName = store.name || 'SelfPrint Store';
      const storeCode = store.storeCode || '';
      const ownerName = store.ownerName || 'Store Owner';

      // Verify that code belongs to the authenticated / requested store
      let targetStoreId = req.body.storeId;
      if (!targetStoreId && req.headers.authorization?.startsWith('Bearer ')) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          const decoded: any = jwtUtils.verifyToken(token);
          targetStoreId = decoded.storeId || decoded.sub || decoded.id;
        } catch (tokenErr) {
          logger.warn(`Failed to decode JWT token in pair request:`, tokenErr);
        }
      }

      if (targetStoreId && codeRecord.storeId.toString() !== targetStoreId.toString()) {
        logger.warn(
          `Pairing Code Store Mismatch: Code ${cleanCode} belongs to Store ${codeRecord.storeId}, but authenticated user requested Store ${targetStoreId}`
        );
        res.status(403).json({
          success: false,
          error: 'Store Mismatch',
          message: 'This pairing code belongs to a different store. Please use a code generated for your authenticated store.'
        });
        return;
      }

      logger.info(`[Pair Code Verified] Code ${cleanCode} verified for Store ${codeRecord.storeId} (${storeName})`);

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
          `Ownership Conflict: Connector ${connectorId} is already owned by "${ownerStoreName}" (${existingConnector.storeId}). Rejected pairing with Store ${codeRecord.storeId}`
        );
        res.status(403).json({
          success: false,
          code: 'ALREADY_OWNED',
          error: 'Ownership Conflict',
          message: `This connector is already registered to another store (${ownerStoreName}). Unpair the connector before connecting to this store.`
        });
        return;
      }

      // Generate permanent cryptographic Device Token
      const deviceToken = `dt_${crypto.randomBytes(32).toString('hex')}`;

      // Extract full registration metadata
      const machineName = req.body.machineName || req.body.hostname || hostname || 'Host Device';
      const operatingSystem = req.body.operatingSystem || req.body.os || os || 'Windows';
      const connectorVersion = req.body.connectorVersion || req.body.version || version || '1.0.0';
      const localIp = req.body.localIp || req.body.ipAddress || (req.socket.remoteAddress || '');
      const publicIp = req.body.publicIp || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || '';

      // Permanently link connector to store in MongoDB
      const connector = await ConnectorModel.findOneAndUpdate(
        { connectorId },
        {
          connectorId,
          storeId: codeRecord.storeId,
          storeName,
          merchantId: store._id,
          machineId,
          hostname: machineName,
          machineName,
          windowsUser: windowsUser || 'User',
          os: operatingSystem,
          operatingSystem,
          version: connectorVersion,
          connectorVersion,
          localIp,
          publicIp,
          deviceToken,
          status: 'ONLINE',
          state: 'CONNECTED',
          lastHeartbeat: new Date(),
          lastSeen: new Date(),
          pairedAt: new Date(),
          hostRunning: true,
          authenticated: true,
          paired: true,
          connectedPrinters: 0,
          physicalPrinters: []
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

      logger.info(`[Connector Registered] Connector ${connectorId} registered for Store ${codeRecord.storeId} (${storeName}) on machine ${machineName}`);
      logger.info(`[Connector paired] Connector ${connectorId} paired with store ${codeRecord.storeId} (${storeName})`);
      logger.info(`[Status updated in MongoDB] Connector ${connectorId} marked PAIRED in MongoDB`);

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
          error: 'Store ID is required'
        });
        return;
      }

      const store = await StoreModel.findById(storeId);
      if (!store || store.isDeleted || store.status === 'DELETED') {
        res.status(403).json({
          success: false,
          code: 'STORE_DELETED',
          message: 'This store has been deleted by the administrator.'
        });
        return;
      }

      if (store.blocked || store.status === 'BLOCKED') {
        res.status(403).json({
          success: false,
          code: 'STORE_BLOCKED',
          message: 'Your store has been blocked by the administrator. Please contact support.'
        });
        return;
      }

      const connector = await ConnectorModel.findOne({ storeId });
      if (!connector) {
        res.status(200).json({
          success: true,
          paired: false,
          status: 'UNPAIRED',
          state: 'UNPAIRED',
          message: 'No connector is currently paired with this store'
        });
        return;
      }

      // Check heartbeat freshness: offline if lastHeartbeat is older than 35 seconds
      const now = Date.now();
      const lastHbTime = connector.lastHeartbeat ? new Date(connector.lastHeartbeat).getTime() : 0;
      const isOnline = lastHbTime > 0 && (now - lastHbTime) < 35000;

      const liveStatus = isOnline ? 'ONLINE' : 'OFFLINE';
      const liveState = isOnline ? 'CONNECTED' : 'DISCONNECTED';

      const statusData = {
        paired: true,
        testMode: Boolean(store.testMode),
        connectorId: connector.connectorId,
        storeId: connector.storeId,
        storeName: connector.storeName,
        machineName: connector.hostname || connector.machineName,
        hostname: connector.hostname,
        os: connector.os || connector.operatingSystem,
        operatingSystem: connector.operatingSystem || connector.os,
        version: connector.version || connector.connectorVersion,
        connectorVersion: connector.connectorVersion || connector.version,
        status: liveStatus,
        state: liveState,
        lastHeartbeat: connector.lastHeartbeat,
        pairedAt: connector.pairedAt,
        connectedPrinters: connector.connectedPrinters || (connector.physicalPrinters?.length ?? 0),
        physicalPrinters: connector.physicalPrinters || [],
        localIp: connector.localIp,
        publicIp: connector.publicIp
      };

      res.status(200).json({
        success: true,
        ...statusData,
        data: statusData
      });
    } catch (err: any) {
      logger.error('Error retrieving connector status:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to get connector status'
      });
    }
  }

  /**
   * Records heartbeat from Desktop Connector daemon and updates live hardware state.
   * POST /api/v1/connectors/heartbeat
   */
  public async recordHeartbeat(req: Request, res: Response): Promise<void> {
    try {
      const {
        connectorId,
        printers,
        connectedPrinters,
        status,
        state,
        machineId,
        version,
        deviceToken
      } = req.body;

      if (!connectorId && !deviceToken) {
        res.status(400).json({ success: false, error: 'connectorId or deviceToken is required' });
        return;
      }

      const query: any = connectorId ? { connectorId } : { deviceToken };
      const connector = await ConnectorModel.findOne(query);

      if (!connector) {
        res.status(404).json({ success: false, error: 'Connector not registered or paired' });
        return;
      }

      const store = await StoreModel.findById(connector.storeId);
      if (!store || store.isDeleted || store.status === 'DELETED') {
        res.status(403).json({
          success: false,
          code: 'STORE_DELETED',
          error: 'This store has been deleted by the administrator.'
        });
        return;
      }

      if (store.blocked || store.status === 'BLOCKED') {
        res.status(403).json({
          success: false,
          code: 'STORE_BLOCKED',
          error: 'Your store has been blocked by the administrator. Please contact support.'
        });
        return;
      }

      // Live physical printers directly from connector scan
      const livePrinters = Array.isArray(printers) ? printers : [];
      const count = typeof connectedPrinters === 'number' ? connectedPrinters : livePrinters.length;

      // Update connector heartbeat and physical printers list in MongoDB
      connector.lastHeartbeat = new Date();
      connector.lastSeen = new Date();
      connector.status = status || 'ONLINE';
      connector.state = state || 'CONNECTED';
      connector.connectedPrinters = count;
      connector.physicalPrinters = livePrinters;
      if (machineId) connector.machineId = machineId;
      if (version) {
        connector.version = version;
        connector.connectorVersion = version;
      }
      await connector.save();

      // Sync physical printers to PrinterModel in database
      if (livePrinters.length >= 0) {
        try {
          const { printerService } = await import('../printer/printer.service');
          await printerService.syncPrinters(
            connector.storeId.toString(),
            connector.connectorId,
            connector.machineId,
            livePrinters
          );
        } catch (syncErr) {
          logger.warn('[Heartbeat] Printer sync error:', syncErr);
        }

        // Broadcast live printers to store dashboard
        socketManager.emitToStore(connector.storeId.toString(), 'printers_updated', {
          connectorId: connector.connectorId,
          storeId: connector.storeId.toString(),
          printers: livePrinters,
          count: count,
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({ success: true, count, timestamp: new Date().toISOString() });
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

      const store = await StoreModel.findById(storeId);
      if (!store || store.isDeleted || store.status === 'DELETED') {
        res.status(403).json({
          success: false,
          code: 'STORE_DELETED',
          message: 'This store has been deleted by the administrator.'
        });
        return;
      }

      if (store.blocked || store.status === 'BLOCKED') {
        res.status(403).json({
          success: false,
          code: 'STORE_BLOCKED',
          message: 'Your store has been blocked by the administrator. Please contact support.'
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
      if (!store || store.isDeleted || store.status === 'DELETED') {
        res.status(403).json({
          success: false,
          valid: false,
          code: 'STORE_DELETED',
          error: 'This store has been deleted by the administrator.'
        });
        return;
      }

      if (store.blocked || store.status === 'BLOCKED') {
        res.status(403).json({
          success: false,
          valid: false,
          code: 'STORE_BLOCKED',
          error: 'Your store has been blocked by the administrator. Please contact support.'
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

      logger.info(`[Unpaired] Connector ${connectorId} successfully unpaired from Store ${storeIdStr}`);

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
   * GET /api/v1/connectors/installer-info
   * Returns metadata about the latest release installer package for the Store Dashboard
   */
  public async getInstallerInfo(req: Request, res: Response): Promise<void> {
    try {
      const releaseInfo = await githubReleaseService.getLatestRelease();
      res.status(200).json({
        success: true,
        version: releaseInfo.version,
        fileName: releaseInfo.fileName,
        sizeMB: releaseInfo.sizeMB,
        sizeBytes: releaseInfo.sizeBytes,
        downloadUrl: '/api/v1/connectors/download',
        directUrl: releaseInfo.downloadUrl,
        available: true,
        platform: 'Windows (x64)',
        supportedOs: 'Windows 10 / 11 (64-bit)',
        releasedAt: releaseInfo.publishedAt
      });
    } catch (err: any) {
      logger.error('Error getting installer info from GitHub:', err);
      res.status(503).json({
        success: false,
        message: 'Connector installer temporarily unavailable.'
      });
    }
  }

  /**
   * GET /api/v1/connectors/download
   * Redirects (302) to the latest GitHub Release installer download URL.
   * Does NOT proxy files through Express or store installer files on Render.
   */
  public async downloadInstaller(req: Request, res: Response): Promise<void> {
    try {
      const releaseInfo = await githubReleaseService.getLatestRelease();
      return res.redirect(releaseInfo.downloadUrl);
    } catch (err: any) {
      logger.error('Error redirecting to latest installer release:', err);
      res.status(503).json({
        success: false,
        message: 'Connector installer temporarily unavailable.'
      });
    }
  }

  /**
   * GET /api/v1/connectors/version
   * Returns latest version tag and GitHub release download URL
   */
  public async getVersion(req: Request, res: Response): Promise<void> {
    try {
      const releaseInfo = await githubReleaseService.getLatestRelease();
      res.status(200).json({
        version: releaseInfo.version,
        download: releaseInfo.downloadUrl
      });
    } catch (err: any) {
      logger.error('Error retrieving connector release version:', err);
      res.status(503).json({
        success: false,
        message: 'Connector installer temporarily unavailable.'
      });
    }
  }
}

export const connectorController = new ConnectorController();
export default connectorController;

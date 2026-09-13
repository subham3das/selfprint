import { Request, Response } from 'express';
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
            physicalPrinters: [],
            connectionState: 'RUNNING_UNPAIRED',
            state: 'NOT_PAIRED',
            status: 'OFFLINE',
            printerCount: 0
          }
        });
        return;
      }

      // Check heartbeat freshness: alive if < 35 seconds (allows grace period for 10s intervals + jitter)
      const diffMs = Date.now() - new Date(connector.lastHeartbeat).getTime();
      const isAlive = diffMs < 35000;
      const effectiveStatus = isAlive ? connector.status : 'OFFLINE';
      const effectiveState = isAlive ? (connector.state || 'READY') : 'OFFLINE';

      // Extract physical printers strictly as array and compute exact count
      const rawPhysical = Array.isArray(connector.physicalPrinters)
        ? connector.physicalPrinters
        : [];
      const printerCount = typeof connector.connectedPrinters === 'number'
        ? connector.connectedPrinters
        : rawPhysical.length;

      // Determine state machine representation
      const connectionState = !isAlive
        ? 'INSTALLED_NOT_RUNNING'
        : effectiveState === 'SCANNING_PRINTERS'
        ? 'SCANNING_PRINTERS'
        : printerCount > 0
        ? 'READY'
        : 'CONNECTED';

      logger.info(`[Connector Status API] Store ${storeId} -> isAlive=${isAlive}, status=${effectiveStatus}, printerCount=${printerCount}, physicalPrinters=${JSON.stringify(rawPhysical.map((p: any) => p.name || p.printerName || p.id))}`);

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
            physicalPrinters: rawPhysical,
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
            connectedPrinters: printerCount
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
          physicalPrinters: rawPhysical,
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
          connectedPrinters: printerCount
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

      // Live physical printers array reported by Desktop Connector
      const livePrinters: any[] = Array.isArray(physicalPrinters)
        ? physicalPrinters
        : (Array.isArray(printers) ? printers : []);
      const count = typeof physicalPrinterCount === 'number'
        ? physicalPrinterCount
        : livePrinters.length;

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
        physicalPrinters: livePrinters,
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

      // If connector is already paired in DB, keep authenticated true even if daemon token sync was delayed
      const existingConn = await ConnectorModel.findOne(query);
      if (existingConn && existingConn.deviceToken) {
        updateData.authenticated = true;
        if (updateData.state === 'NOT_PAIRED') {
          updateData.state = 'READY';
        }
      }

      const connector = await ConnectorModel.findOneAndUpdate(
        query,
        { $set: updateData },
        { new: true }
      );

      if (connector) {
        logger.info(`[Heartbeat Ingest] Connector ${connectorId || connector.connectorId} (store: ${connector.storeId}) reported ${count} physical printer(s): ${JSON.stringify(livePrinters.map((p: any) => p.name || p.printerName || p.id))}`);
        logger.info(`[Status updated in MongoDB] Connector ${connectorId || connector.connectorId} status updated: status=${updateData.status}, state=${updateData.state}, connectedPrinters=${count}`);

        connectorRegistry.recordHeartbeat(connectorId, updateData.health);

        // Broadcast heartbeat event to store room with full fields
        socketManager.emitToStore(connector.storeId.toString(), 'heartbeat', {
          connectorId: connector.connectorId,
          storeId: connector.storeId.toString(),
          status: 'ONLINE',
          state: updateData.state,
          paired: true,
          authenticated: updateData.authenticated,
          socketConnected: updateData.socketConnected,
          hostRunning: updateData.hostRunning,
          printerCount: count,
          printersCount: count,
          physicalPrinterCount: count,
          printers: livePrinters,
          physicalPrinters: livePrinters,
          lastHeartbeat: updateData.lastHeartbeat,
          health: updateData.health,
          timestamp: timestamp || new Date().toISOString()
        });

        // Always broadcast printers_updated so web dashboard immediately reflects live count (0 or more)
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

import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { getDeviceIdentity, DeviceIdentity } from '../device/identity';
import { logger } from '../utils/logger';

export interface ConnectorSettings {
  backendUrl: string;
  port: number;
  scanIntervalMs: number;
  heartbeatIntervalMs: number;
  includeVirtualPrinters: boolean;
  logLevel?: string;
}

export interface ConnectorData {
  connectorId: string;
  machineId: string;
  deviceToken: string | null;
  connectorVersion: string;
  lastHeartbeat: string | null;
  connectorSettings: ConnectorSettings;
}

class ConnectorStore {
  private configDir: string;
  private filePath: string;
  private data!: ConnectorData;
  private identity!: DeviceIdentity;

  constructor() {
    this.configDir = path.resolve(process.cwd(), 'config');
    this.filePath = path.join(this.configDir, 'connector.json');
    this.load();
  }

  private ensureDir(): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  private load(): void {
    this.ensureDir();

    let fileContent: Partial<ConnectorData> = {};
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        fileContent = JSON.parse(raw);
      } catch (err) {
        logger.warn('Failed to parse connector.json, restoring defaults.');
      }
    }

    this.identity = getDeviceIdentity(fileContent.connectorId);

    this.data = {
      connectorId: fileContent.connectorId || this.identity.connectorId,
      machineId: this.identity.machineId,
      deviceToken: fileContent.deviceToken || env.DEVICE_TOKEN || null,
      connectorVersion: this.identity.connectorVersion,
      lastHeartbeat: fileContent.lastHeartbeat || null,
      connectorSettings: {
        backendUrl: env.BACKEND_URL || fileContent.connectorSettings?.backendUrl || 'http://localhost:3000',
        port: env.PORT || fileContent.connectorSettings?.port || 4500,
        scanIntervalMs: env.PRINTER_SCAN_INTERVAL_MS || fileContent.connectorSettings?.scanIntervalMs || 30000,
        heartbeatIntervalMs: env.HEARTBEAT_INTERVAL_MS || fileContent.connectorSettings?.heartbeatIntervalMs || 15000,
        includeVirtualPrinters: env.INCLUDE_VIRTUAL_PRINTERS ?? fileContent.connectorSettings?.includeVirtualPrinters ?? false,
        logLevel: fileContent.connectorSettings?.logLevel || 'INFO'
      }
    };

    this.save();
  }

  public save(): void {
    try {
      this.ensureDir();
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      logger.error('Failed to save connector.json:', err);
    }
  }

  public getData(): ConnectorData {
    return this.data;
  }

  public getIdentity(): DeviceIdentity {
    return this.identity;
  }

  public getSettings(): ConnectorSettings {
    return this.data.connectorSettings;
  }

  public getDeviceToken(): string | null {
    return this.data.deviceToken;
  }

  public setDeviceToken(token: string): void {
    this.data.deviceToken = token;
    this.save();
    logger.info('Device authentication token saved securely.');
  }

  public isRegistered(): boolean {
    return Boolean(this.data.deviceToken && this.data.deviceToken.trim().length > 0);
  }

  public updateLastHeartbeat(): void {
    this.data.lastHeartbeat = new Date().toISOString();
    this.save();
  }

  public updateSettings(partial: Partial<ConnectorSettings>): void {
    this.data.connectorSettings = { ...this.data.connectorSettings, ...partial };
    this.save();
  }
}

export const connectorStore = new ConnectorStore();

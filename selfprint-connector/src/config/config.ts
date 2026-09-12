import fs from 'fs';
import path from 'path';
import { env } from './env';
import { logger } from '../utils/logger';

export interface AppConfig {
  backendUrl: string;
  deviceId: string;
  deviceToken: string;
  storeId: string;
  connectorVersion: string;
  port: number;
  logLevel: string;
  heartbeatIntervalMs: number;
  printerScanIntervalMs: number;
  includeVirtualPrinters: boolean;
}

export interface JsonConfigFile {
  backendUrl: string;
  deviceId: string;
  deviceToken: string;
  storeId: string;
  connectorVersion: string;
}

const DEFAULT_JSON_CONFIG: JsonConfigFile = {
  backendUrl: 'https://selfprint.onrender.com',
  deviceId: '',
  deviceToken: '',
  storeId: '',
  connectorVersion: '0.2.0'
};

class ConfigManager {
  private configDir: string;
  private configPath: string;
  private config!: AppConfig;

  constructor() {
    this.configDir = path.resolve(process.cwd(), 'config');
    this.configPath = path.join(this.configDir, 'config.json');
    this.loadConfig();
  }

  private ensureConfigDirectory(): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  private loadJsonConfig(): JsonConfigFile {
    try {
      this.ensureConfigDirectory();
      if (!fs.existsSync(this.configPath)) {
        fs.writeFileSync(this.configPath, JSON.stringify(DEFAULT_JSON_CONFIG, null, 2), 'utf8');
        return { ...DEFAULT_JSON_CONFIG };
      }

      const raw = fs.readFileSync(this.configPath, 'utf8');
      const parsed = JSON.parse(raw);
      return {
        backendUrl: parsed.backendUrl || DEFAULT_JSON_CONFIG.backendUrl,
        deviceId: parsed.deviceId || DEFAULT_JSON_CONFIG.deviceId,
        deviceToken: parsed.deviceToken || DEFAULT_JSON_CONFIG.deviceToken,
        storeId: parsed.storeId || DEFAULT_JSON_CONFIG.storeId,
        connectorVersion: parsed.connectorVersion || DEFAULT_JSON_CONFIG.connectorVersion
      };
    } catch (error) {
      logger.warn(`Could not parse ${this.configPath}, writing defaults.`);
      fs.writeFileSync(this.configPath, JSON.stringify(DEFAULT_JSON_CONFIG, null, 2), 'utf8');
      return { ...DEFAULT_JSON_CONFIG };
    }
  }

  public loadConfig(): AppConfig {
    const jsonConfig = this.loadJsonConfig();

    this.config = {
      backendUrl: env.BACKEND_URL || jsonConfig.backendUrl,
      deviceId: env.DEVICE_ID || jsonConfig.deviceId,
      deviceToken: env.DEVICE_TOKEN || jsonConfig.deviceToken,
      storeId: env.STORE_ID || jsonConfig.storeId,
      connectorVersion: jsonConfig.connectorVersion || '0.1.0',
      port: env.PORT,
      logLevel: env.LOG_LEVEL,
      heartbeatIntervalMs: env.HEARTBEAT_INTERVAL_MS,
      printerScanIntervalMs: env.PRINTER_SCAN_INTERVAL_MS,
      includeVirtualPrinters: env.INCLUDE_VIRTUAL_PRINTERS
    };

    return this.config;
  }

  public getConfig(): AppConfig {
    if (!this.config) {
      this.loadConfig();
    }
    return this.config;
  }

  public updateJsonConfig(updates: Partial<JsonConfigFile>): void {
    try {
      const currentJson = this.loadJsonConfig();
      const updatedJson = { ...currentJson, ...updates };
      fs.writeFileSync(this.configPath, JSON.stringify(updatedJson, null, 2), 'utf8');
      this.loadConfig();
    } catch (error) {
      logger.error('Failed to update config.json', error);
    }
  }
}

export const configManager = new ConfigManager();
export const config = configManager.getConfig();

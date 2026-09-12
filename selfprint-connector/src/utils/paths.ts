import path from 'path';
import fs from 'fs';

/**
 * SystemPathManager
 *
 * Centralizes directory and file locations across the SelfPrint Connector ecosystem.
 *
 * Windows Standard Production Storage:
 *   Root:      %PROGRAMDATA%\SelfPrint\   (e.g. C:\ProgramData\SelfPrint)
 *   Config:    %PROGRAMDATA%\SelfPrint\config\connector.json
 *   Logs:      %PROGRAMDATA%\SelfPrint\logs\
 *   Cache:     %PROGRAMDATA%\SelfPrint\cache\
 *   Updates:   %PROGRAMDATA%\SelfPrint\updates\
 *
 * This ensures that credentials (deviceToken, storeId, machineId, connectorId)
 * survive application updates, uninstalls, and reinstalls.
 */
class SystemPathManager {
  private baseDir: string;
  private configDir: string;
  private logsDir: string;
  private cacheDir: string;
  private updatesDir: string;
  private configFile: string;

  constructor() {
    if (process.platform === 'win32') {
      const programData = process.env.PROGRAMDATA || 'C:\\ProgramData';
      this.baseDir = path.join(programData, 'SelfPrint');
    } else {
      const home = process.env.HOME || process.cwd();
      this.baseDir = path.join(home, '.selfprint');
    }

    this.configDir = path.join(this.baseDir, 'config');
    this.logsDir = path.join(this.baseDir, 'logs');
    this.cacheDir = path.join(this.baseDir, 'cache');
    this.updatesDir = path.join(this.baseDir, 'updates');
    this.configFile = path.join(this.configDir, 'connector.json');

    this.initializeDirectories();
    this.migrateLegacyConfig();
  }

  /**
   * Automatically creates all necessary production directories if they do not exist.
   */
  private initializeDirectories(): void {
    const dirs = [this.baseDir, this.configDir, this.logsDir, this.cacheDir, this.updatesDir];
    for (const dir of dirs) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      } catch (err) {
        // Fallback to local cwd in restricted permission environments
        const localDir = path.resolve(process.cwd(), path.basename(dir));
        if (!fs.existsSync(localDir)) {
          try { fs.mkdirSync(localDir, { recursive: true }); } catch {}
        }
      }
    }
  }

  /**
   * Backwards Compatibility Migration:
   * If %PROGRAMDATA%\SelfPrint\config\connector.json does not exist yet,
   * but a legacy ./config/connector.json exists from development, seamlessly copy it over.
   */
  private migrateLegacyConfig(): void {
    try {
      if (!fs.existsSync(this.configFile)) {
        const legacyPath = path.resolve(process.cwd(), 'config', 'connector.json');
        if (fs.existsSync(legacyPath)) {
          fs.copyFileSync(legacyPath, this.configFile);
        }
      }
    } catch {
      // Non-blocking migration attempt
    }
  }

  public getBaseDir(): string {
    return this.baseDir;
  }

  public getConfigDir(): string {
    return this.configDir;
  }

  public getConfigFile(): string {
    return this.configFile;
  }

  public getLogsDir(): string {
    return this.logsDir;
  }

  public getCacheDir(): string {
    return this.cacheDir;
  }

  public getUpdatesDir(): string {
    return this.updatesDir;
  }
}

export const systemPaths = new SystemPathManager();
export default systemPaths;

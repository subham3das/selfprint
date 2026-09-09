import { connectorStore } from '../storage/connectorStore';
import { emitEvent } from '../websocket/socket';
import { logger } from '../utils/logger';

export interface VersionManifest {
  latestVersion: string;
  downloadUrl: string;
  releaseNotes: string;
  mandatory: boolean;
  checksum?: string;
}

export class UpdateChecker {
  private timer: NodeJS.Timeout | null = null;
  private currentVersion: string;

  constructor() {
    this.currentVersion = connectorStore.getIdentity().connectorVersion || '0.2.0';
  }

  /**
   * Compares two semantic version strings (e.g. 0.3.0 > 0.2.0).
   */
  private isNewerVersion(remoteVersion: string, localVersion: string): boolean {
    const parse = (v: string) => v.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
    const [rMajor, rMinor, rPatch] = parse(remoteVersion);
    const [lMajor, lMinor, lPatch] = parse(localVersion);

    if (rMajor > lMajor) return true;
    if (rMajor === lMajor && rMinor > lMinor) return true;
    if (rMajor === lMajor && rMinor === lMinor && rPatch > lPatch) return true;
    return false;
  }

  /**
   * Queries backend for the latest available connector version.
   */
  public async checkForUpdate(): Promise<VersionManifest | null> {
    const { backendUrl } = connectorStore.getSettings();
    const url = `${backendUrl.replace(/\/$/, '')}/api/v1/connectors/version`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `SelfPrintConnector/${this.currentVersion}`
        },
        signal: AbortSignal.timeout(6000)
      });

      if (!response.ok) {
        return null;
      }

      const manifest = (await response.json()) as VersionManifest;
      if (manifest && manifest.latestVersion) {
        if (this.isNewerVersion(manifest.latestVersion, this.currentVersion)) {
          logger.info(`[Update Checker] New version available: v${manifest.latestVersion} (Current: v${this.currentVersion})`);
          emitEvent('update_available', {
            currentVersion: this.currentVersion,
            latestVersion: manifest.latestVersion,
            downloadUrl: manifest.downloadUrl,
            mandatory: manifest.mandatory,
            releaseNotes: manifest.releaseNotes,
            timestamp: new Date().toISOString()
          });
          return manifest;
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Starts periodic hourly version check.
   */
  public start(intervalMs = 3600000): void {
    if (this.timer) clearInterval(this.timer);
    setTimeout(() => this.checkForUpdate().catch(() => {}), 10000); // Check 10s after boot
    this.timer = setInterval(() => {
      this.checkForUpdate().catch(() => {});
    }, intervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const updateChecker = new UpdateChecker();

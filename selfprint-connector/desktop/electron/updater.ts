import { BrowserWindow, ipcMain, app } from 'electron';
import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater';

export type UpdateState =
  | 'IDLE'
  | 'CHECKING'
  | 'AVAILABLE'
  | 'DOWNLOADING'
  | 'DOWNLOADED'
  | 'UP_TO_DATE'
  | 'ERROR';

export interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

export interface UpdateStatusPayload {
  state: UpdateState;
  currentVersion: string;
  latestVersion?: string;
  progress?: UpdateProgress;
  error?: string;
  releaseNotes?: string;
  releaseDate?: string;
  lastChecked?: string;
}

export class AutoUpdateService {
  private window: BrowserWindow | null = null;
  private checkIntervalTimer: NodeJS.Timeout | null = null;
  private startupTimer: NodeJS.Timeout | null = null;
  private isChecking = false;
  private isDownloading = false;

  private currentStatus: UpdateStatusPayload = {
    state: 'IDLE',
    currentVersion: app.getVersion()
  };

  constructor() {
    this.setupAutoUpdater();
    this.registerIpcHandlers();
  }

  private setupAutoUpdater(): void {
    // Configure electron-updater
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = false;

    // In development mode, mock update checking without throwing missing file errors
    if (!app.isPackaged) {
      autoUpdater.forceDevUpdateConfig = true;
    }

    // 1. Checking for update
    autoUpdater.on('checking-for-update', () => {
      this.isChecking = true;
      console.log('[Updater] Checking for updates');
      this.updateStatus({
        state: 'CHECKING',
        error: undefined
      });
    });

    // 2. Update available
    autoUpdater.on('update-available', (info: UpdateInfo) => {
      this.isChecking = false;
      this.isDownloading = true;
      const latestVer = info.version || 'unknown';
      console.log(`[Updater] Update available v${latestVer}`);

      let notes = '';
      if (typeof info.releaseNotes === 'string') {
        notes = info.releaseNotes;
      } else if (Array.isArray(info.releaseNotes)) {
        notes = info.releaseNotes.map((n) => (typeof n === 'string' ? n : n.note)).join('\n');
      }

      this.updateStatus({
        state: 'AVAILABLE',
        latestVersion: latestVer,
        releaseNotes: notes,
        releaseDate: info.releaseDate,
        error: undefined
      });
    });

    // 3. Update not available (Already latest version)
    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      this.isChecking = false;
      this.isDownloading = false;
      console.log('[Updater] Already latest version');
      this.updateStatus({
        state: 'UP_TO_DATE',
        latestVersion: info.version || app.getVersion(),
        error: undefined
      });
    });

    // 4. Download progress
    autoUpdater.on('download-progress', (progressObj: ProgressInfo) => {
      this.isDownloading = true;
      const pct = Math.round(progressObj.percent);
      console.log(`[Updater] Download ${pct}%`);
      this.updateStatus({
        state: 'DOWNLOADING',
        progress: {
          percent: pct,
          bytesPerSecond: progressObj.bytesPerSecond,
          transferred: progressObj.transferred,
          total: progressObj.total
        }
      });
    });

    // 5. Update downloaded
    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      this.isChecking = false;
      this.isDownloading = false;
      console.log('[Updater] Download complete');
      this.updateStatus({
        state: 'DOWNLOADED',
        latestVersion: info.version,
        progress: {
          percent: 100,
          bytesPerSecond: 0,
          transferred: 100,
          total: 100
        }
      });
    });

    // 6. Error handling (Never crash, log and update state)
    autoUpdater.on('error', (err: Error) => {
      this.isChecking = false;
      this.isDownloading = false;
      const errMsg = err?.message || String(err);
      console.error(`[Updater] Update failed: ${errMsg}`);
      this.updateStatus({
        state: 'ERROR',
        error: errMsg
      });
    });
  }

  private updateStatus(partial: Partial<UpdateStatusPayload>): void {
    this.currentStatus = {
      ...this.currentStatus,
      ...partial,
      currentVersion: app.getVersion(),
      lastChecked: new Date().toISOString()
    };

    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send('updater:status-changed', this.currentStatus);
    }
  }

  private registerIpcHandlers(): void {
    ipcMain.handle('updater:check', async () => {
      return this.checkForUpdates(true);
    });

    ipcMain.handle('updater:restart', () => {
      this.quitAndInstall();
    });

    ipcMain.handle('updater:get-status', () => {
      return this.currentStatus;
    });
  }

  public init(window: BrowserWindow): void {
    this.window = window;

    // Requirement 4: Wait until app is fully initialized (15 seconds) before checking
    this.startupTimer = setTimeout(() => {
      console.log('[Updater] Initial startup delay elapsed. Initiating automatic background update check...');
      this.checkForUpdates(false).catch((err) => {
        console.warn('[Updater] Background startup update check failed silently:', err?.message || err);
      });
    }, 15000);

    // Requirement 4: Check again every 6 hours (6 * 3600 * 1000 ms)
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
    this.checkIntervalTimer = setInterval(() => {
      console.log('[Updater] Periodic 6-hour interval check initiated...');
      this.checkForUpdates(false).catch((err) => {
        console.warn('[Updater] Periodic update check failed silently:', err?.message || err);
      });
    }, SIX_HOURS_MS);
  }

  public async checkForUpdates(isManual = false): Promise<UpdateStatusPayload> {
    if (this.isChecking || this.isDownloading) {
      return this.currentStatus;
    }

    try {
      this.updateStatus({ state: 'CHECKING', error: undefined });
      if (!app.isPackaged) {
        // Mock graceful response in development mode
        console.log('[Updater] Dev mode detected: Mocking update check.');
        await new Promise((r) => setTimeout(r, 1200));
        this.updateStatus({ state: 'UP_TO_DATE' });
        console.log('[Updater] Already latest version');
        return this.currentStatus;
      }

      await autoUpdater.checkForUpdates();
      return this.currentStatus;
    } catch (err: any) {
      const errMsg = err?.message || 'Network error while checking for updates';
      console.error(`[Updater] Update failed: ${errMsg}`);
      this.updateStatus({
        state: 'ERROR',
        error: errMsg
      });
      return this.currentStatus;
    }
  }

  public quitAndInstall(): void {
    console.log('[Updater] Restarting to install');
    try {
      autoUpdater.quitAndInstall(false, true);
    } catch (err) {
      console.error('[Updater] Failed to quit and install:', err);
    }
  }

  public stop(): void {
    if (this.startupTimer) {
      clearTimeout(this.startupTimer);
      this.startupTimer = null;
    }
    if (this.checkIntervalTimer) {
      clearInterval(this.checkIntervalTimer);
      this.checkIntervalTimer = null;
    }
  }
}

export const autoUpdateService = new AutoUpdateService();

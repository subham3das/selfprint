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
    console.log('[Updater] Service Created');
    console.log(`[Updater] app.isPackaged: ${app.isPackaged}`);
    console.log(`[Updater] app.getVersion(): ${app.getVersion()}`);
    console.log(`[Updater] autoUpdater.currentVersion.version: ${autoUpdater.currentVersion?.version || autoUpdater.currentVersion?.raw || app.getVersion()}`);

    this.setupAutoUpdater();
    this.registerIpcHandlers();
  }

  private setupAutoUpdater(): void {
    // Configure electron-updater
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = false;

    // Force dev update config if running unpacked/dev to allow testing
    autoUpdater.forceDevUpdateConfig = true;

    // 1. checking-for-update
    autoUpdater.on('checking-for-update', () => {
      this.isChecking = true;
      console.log('[Updater] Checking for updates (checking-for-update event received)');
      this.updateStatus({
        state: 'CHECKING',
        error: undefined
      });
    });

    // 2. update-available
    autoUpdater.on('update-available', (info: UpdateInfo) => {
      this.isChecking = false;
      this.isDownloading = true;
      const latestVer = info.version || 'unknown';
      console.log(`[Updater] Update available: v${latestVer}`);

      let notes = '';
      if (typeof info.releaseNotes === 'string') {
        notes = info.releaseNotes;
      } else if (Array.isArray(info.releaseNotes)) {
        notes = info.releaseNotes.map((n) => (typeof n === 'string' ? n : (n as any).note)).join('\n');
      }

      this.updateStatus({
        state: 'AVAILABLE',
        latestVersion: latestVer,
        releaseNotes: notes,
        releaseDate: info.releaseDate,
        error: undefined
      });
    });

    // 3. update-not-available
    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      this.isChecking = false;
      this.isDownloading = false;
      console.log(`[Updater] Update not available. Already on latest version (v${info.version || app.getVersion()})`);
      this.updateStatus({
        state: 'UP_TO_DATE',
        latestVersion: info.version || app.getVersion(),
        error: undefined
      });
    });

    // 4. download-progress
    autoUpdater.on('download-progress', (progressObj: ProgressInfo) => {
      this.isDownloading = true;
      const pct = Math.round(progressObj.percent);
      console.log(`[Updater] Download progress: ${pct}% (${progressObj.transferred}/${progressObj.total} bytes @ ${progressObj.bytesPerSecond} B/s)`);
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

    // 5. update-downloaded
    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      this.isChecking = false;
      this.isDownloading = false;
      console.log(`[Updater] Download complete for v${info.version}. Ready to quit and install.`);
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

    // 6. error
    autoUpdater.on('error', (err: Error) => {
      this.isChecking = false;
      this.isDownloading = false;
      console.error('[Updater] AutoUpdater error event:', err?.stack || err?.message || err);
      this.updateStatus({
        state: 'ERROR',
        error: err?.message || String(err)
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

  public initialize(window: BrowserWindow): void {
    console.log('[Updater] Initializing');
    this.window = window;

    console.log('[Updater] Waiting 15 seconds');
    this.startupTimer = setTimeout(() => {
      console.log('[Updater] 15 seconds elapsed. Starting startup update check...');
      this.checkForUpdates(false).catch((err) => {
        console.error('[Updater] Error during startup update check:', err?.stack || err?.message || err);
      });
    }, 15000);

    // Periodic check every 6 hours
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
    this.checkIntervalTimer = setInterval(() => {
      console.log('[Updater] Periodic 6-hour interval check triggered');
      this.checkForUpdates(false).catch((err) => {
        console.error('[Updater] Error during periodic update check:', err?.stack || err?.message || err);
      });
    }, SIX_HOURS_MS);
  }

  // Backward-compat alias
  public init(window: BrowserWindow): void {
    this.initialize(window);
  }

  public async checkForUpdates(_isManual = false): Promise<UpdateStatusPayload> {
    if (this.isChecking || this.isDownloading) {
      console.log('[Updater] Check or download already in progress. Skipping duplicate request.');
      return this.currentStatus;
    }

    console.log('[Updater] Checking for updates');
    console.log(`[Updater] Runtime Context -> isPackaged: ${app.isPackaged}, appVersion: ${app.getVersion()}, updaterVersion: ${autoUpdater.currentVersion?.version || autoUpdater.currentVersion?.raw}`);

    try {
      this.updateStatus({ state: 'CHECKING', error: undefined });
      
      // Execute autoUpdater.checkForUpdates() directly without skipping
      const checkResult = await autoUpdater.checkForUpdates();
      console.log('[Updater] checkForUpdates() promise resolved:', checkResult?.updateInfo?.version ? `Target version: v${checkResult.updateInfo.version}` : 'Check completed');
      return this.currentStatus;
    } catch (err: any) {
      console.error('[Updater] Complete error thrown from checkForUpdates():', {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
        cause: err?.cause
      });
      this.updateStatus({
        state: 'ERROR',
        error: err?.message || 'Network error while checking for updates'
      });
      return this.currentStatus;
    }
  }

  public quitAndInstall(): void {
    console.log('[Updater] Restarting to install downloaded update...');
    try {
      autoUpdater.quitAndInstall(false, true);
    } catch (err) {
      console.error('[Updater] Failed to quit and install update:', err);
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

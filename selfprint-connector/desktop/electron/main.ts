import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell, Notification } from 'electron';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { spawn, ChildProcess } from 'child_process';
import { autoUpdateService } from './updater';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let hostDaemonProcess: ChildProcess | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function checkHostRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:4500/health', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1200, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureHostService(): Promise<void> {
  const isRunning = await checkHostRunning();
  if (isRunning) {
    console.log('[Main] SelfPrint Host Service is already running on http://127.0.0.1:4500');
    return;
  }

  console.log('[Main] Host Service not detected on port 4500. Automatically spawning background daemon...');
  
  // 1. Packaged Production Daemon (inside extraResources: resources/host-service/)
  const packagedDaemonPath = path.join(process.resourcesPath, 'host-service', 'dist', 'app.js');
  
  // 2. Development Paths
  const appRoot = path.resolve(__dirname, '../../');
  const tsAppPath = path.join(appRoot, 'src', 'app.ts');
  const jsAppPath = path.join(appRoot, 'dist', 'app.js');

  try {
    if (app.isPackaged && fs.existsSync(packagedDaemonPath)) {
      // In production packaged mode, run daemon using Electron's Node runtime
      console.log(`[Main] Launching production host service from: ${packagedDaemonPath}`);
      hostDaemonProcess = spawn(process.execPath, [packagedDaemonPath], {
        cwd: path.dirname(packagedDaemonPath),
        stdio: 'pipe',
        env: {
          ...process.env,
          ELECTRON_RUN_AS_NODE: '1',
          PORT: '4500'
        }
      });
    } else if (isDev && fs.existsSync(tsAppPath)) {
      const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
      hostDaemonProcess = spawn(npxCmd, ['ts-node', 'src/app.ts'], {
        cwd: appRoot,
        stdio: 'pipe',
        shell: true,
        env: { ...process.env, PORT: '4500' }
      });
    } else if (fs.existsSync(jsAppPath)) {
      hostDaemonProcess = spawn(process.execPath, [jsAppPath], {
        cwd: appRoot,
        stdio: 'pipe',
        env: { ...process.env, PORT: '4500' }
      });
    }

    if (hostDaemonProcess) {
      hostDaemonProcess.stdout?.on('data', (data) => {
        console.log(`[HostDaemon] ${data.toString().trim()}`);
      });
      hostDaemonProcess.stderr?.on('data', (data) => {
        console.error(`[HostDaemon ERR] ${data.toString().trim()}`);
      });
      
      // Watchdog Auto-Restart: Restores daemon automatically if crashed
      hostDaemonProcess.on('exit', (code) => {
        console.log(`[HostDaemon] Process exited with code ${code}`);
        hostDaemonProcess = null;
        if (!isQuitting) {
          console.warn('[Main] Host service daemon terminated unexpectedly. Auto-recovering in 3s...');
          setTimeout(() => {
            if (!isQuitting) {
              ensureHostService().catch(() => {});
            }
          }, 3000);
        }
      });

      // Wait up to 10 seconds for port 4500 to bind
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 250));
        if (await checkHostRunning()) {
          console.log('[Main] Host service daemon successfully started on port 4500.');
          break;
        }
      }
    }
  } catch (err) {
    console.error('[Main] Failed to spawn host service daemon:', err);
  }
}

// Register custom URL protocol scheme: selfprint://
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('selfprint', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('selfprint');
}

// Ensure single instance lock (in dev mode, don't silently exit if reloaded)
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock && !isDev) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();

      // Find connector-specific deep link in arguments (e.g. selfprint://connector/printers)
      const url = commandLine.find((arg) => arg.startsWith('selfprint://connector'));
      if (url) {
        handleDeepLink(url);
      }
    }
  });
}

/**
 * Handles explicit connector deep-links only.
 * Supported routes:
 * - selfprint://connector
 * - selfprint://connector/dashboard
 * - selfprint://connector/printers
 * - selfprint://connector/settings
 * - selfprint://connector/activity
 * - selfprint://connector/notifications
 * All other URLs and protocols are strictly ignored.
 */
function handleDeepLink(url: string): void {
  try {
    if (!url || typeof url !== 'string' || !url.startsWith('selfprint://connector')) {
      return;
    }

    const parsed = new URL(url);
    if (parsed.protocol !== 'selfprint:') {
      return;
    }

    const host = (parsed.hostname || parsed.host || '').toLowerCase();
    if (host !== 'connector') {
      return;
    }

    const cleanPath = parsed.pathname.replace(/^\/+/, '').toLowerCase();

    const routeMap: Record<string, string> = {
      '': 'dashboard',
      'dashboard': 'dashboard',
      'printers': 'printers',
      'settings': 'settings',
      'activity': 'activity',
      'notifications': 'notifications'
    };

    if (!(cleanPath in routeMap)) {
      return;
    }

    const targetTab = routeMap[cleanPath];
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('navigate-tab', targetTab);
    }
  } catch {
    // Silently ignore malformed deep links
  }
}

function getAppIcon(): Electron.NativeImage {
  const possiblePaths = [
    path.join(__dirname, 'logoapp.png'),
    path.join(__dirname, '../public/logoapp.png'),
    path.join(__dirname, '../../src/logoapp.png')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return nativeImage.createFromPath(p);
    }
  }

  // Fallback 16x16 icon
  return nativeImage.createFromBuffer(
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVR42mNk+M9QDwAE/gP5n0F0jAaM8oFhNAwGYAMDA8N/BgaG//8ZGRkYGBj+M1ABAACnmgz3vA3tYgAAAABJRU5ErkJggg==',
      'base64'
    )
  );
}

function createWindow(): void {
  const icon = getAppIcon();

  mainWindow = new BrowserWindow({
    title: 'SelfPrint Connector',
    width: 1080,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#090d16',
    icon: icon,
    show: true,
    center: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:5174';
  const distIndexPath = path.join(__dirname, '../dist/index.html');

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer] [L${level}] ${message} (${sourceId}:${line})`);
  });

  let hasLoaded = false;
  let retryCount = 0;
  const maxRetries = 15;

  if (isDev) {
    const loadDevServer = () => {
      if (hasLoaded || !mainWindow) return;
      retryCount++;
      mainWindow.loadURL(DEV_SERVER_URL).catch(() => {
        if (retryCount < maxRetries) {
          setTimeout(loadDevServer, 500);
        } else if (fs.existsSync(distIndexPath)) {
          mainWindow?.loadFile(distIndexPath);
        }
      });
    };
    loadDevServer();

    mainWindow.webContents.on('did-fail-load', (_event, errorCode) => {
      if (!hasLoaded) {
        if (retryCount < maxRetries) {
          setTimeout(loadDevServer, 500);
        } else if (fs.existsSync(distIndexPath)) {
          mainWindow?.loadFile(distIndexPath);
        }
      }
    });
  } else {
    mainWindow.loadFile(distIndexPath);
  }

  mainWindow.webContents.on('did-finish-load', () => {
    hasLoaded = true;
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
    const initialUrl = process.argv.find((arg) => arg.startsWith('selfprint://connector'));
    if (initialUrl) {
      handleDeepLink(initialUrl);
    }
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      if (Notification.isSupported()) {
        new Notification({
          title: 'SelfPrint Connector',
          body: 'Connector is running minimized in system tray.',
          icon: icon
        }).show();
      }
    }
  });
}

function createTray(): void {
  const appIcon = getAppIcon();
  const trayIcon = appIcon.resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);
  tray.setToolTip('SelfPrint Connector — Local Device Control');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'SelfPrint Connector',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Open Connector',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      }
    },
    {
      label: 'Notifications',
      click: () => {
        mainWindow?.show();
        mainWindow?.webContents.send('navigate-tab', 'notifications');
      }
    },
    {
      label: 'Reconnect',
      click: () => {
        mainWindow?.webContents.send('trigger-action', 'reconnect');
      }
    },
    {
      label: 'Refresh Printers',
      click: () => {
        mainWindow?.webContents.send('trigger-action', 'refresh_printers');
      }
    },
    {
      label: 'Restart',
      click: () => {
        mainWindow?.webContents.send('trigger-action', 'restart');
      }
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });
}

// macOS open-url handler
app.on('open-url', (event, url) => {
  event.preventDefault();
  if (url && url.startsWith('selfprint://connector')) {
    handleDeepLink(url);
  }
});

app.whenReady().then(async () => {
  await ensureHostService();
  createWindow();
  createTray();

  if (mainWindow) {
    autoUpdateService.init(mainWindow);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  autoUpdateService.stop();
  if (hostDaemonProcess) {
    try {
      hostDaemonProcess.kill();
    } catch {}
    hostDaemonProcess = null;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep running in tray
  }
});

// IPC Window Controls
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow?.close();
});

ipcMain.on('open-external', (_event, url: string) => {
  shell.openExternal(url);
});

ipcMain.on('open-path', (_event, dirPath: string) => {
  shell.openPath(dirPath);
});

ipcMain.on('show-notification', (_event, { title, body }: { title: string; body: string }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, icon: getAppIcon() }).show();
  }
});

// Windows Auto-Start on System Boot
ipcMain.handle('get-auto-start', () => {
  try {
    return app.getLoginItemSettings().openAtLogin;
  } catch {
    return false;
  }
});

ipcMain.handle('set-auto-start', (_event, enabled: boolean) => {
  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      args: ['--hidden']
    });
    return app.getLoginItemSettings().openAtLogin;
  } catch (err) {
    console.error('Failed to update login item settings:', err);
    return false;
  }
});

// ProgramData Folders
function getProgramDataPaths() {
  const base = process.platform === 'win32'
    ? path.join(process.env.PROGRAMDATA || 'C:\\ProgramData', 'SelfPrint')
    : path.join(process.env.HOME || process.cwd(), '.selfprint');
  return {
    base,
    config: path.join(base, 'config'),
    logs: path.join(base, 'logs')
  };
}

ipcMain.on('open-logs-folder', () => {
  const { logs } = getProgramDataPaths();
  try {
    if (!fs.existsSync(logs)) fs.mkdirSync(logs, { recursive: true });
    shell.openPath(logs);
  } catch (err) {
    console.error('Failed to open logs folder:', err);
  }
});

ipcMain.on('open-config-folder', () => {
  const { config } = getProgramDataPaths();
  try {
    if (!fs.existsSync(config)) fs.mkdirSync(config, { recursive: true });
    shell.openPath(config);
  } catch (err) {
    console.error('Failed to open config folder:', err);
  }
});

// Direct config sync fallback (guarantees credentials are saved even if HTTP 4500 is delayed)
ipcMain.handle('save-config', async (_event, data: { deviceToken?: string; storeId?: string }) => {
  try {
    const { config } = getProgramDataPaths();
    const configPath = path.join(config, 'connector.json');
    if (!fs.existsSync(config)) {
      fs.mkdirSync(config, { recursive: true });
    }
    let current: any = {};
    if (fs.existsSync(configPath)) {
      try {
        current = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch {}
    }
    if (data.deviceToken) current.deviceToken = data.deviceToken;
    if (data.storeId) current.storeId = data.storeId;
    fs.writeFileSync(configPath, JSON.stringify(current, null, 2), 'utf8');
    console.log('[Main] Saved connector config directly to disk:', configPath);
    return true;
  } catch (err) {
    console.error('[Main] Failed to save config directly to disk:', err);
    return false;
  }
});

ipcMain.handle('clear-config', async () => {
  try {
    const { config } = getProgramDataPaths();
    const configPath = path.join(config, 'connector.json');
    if (fs.existsSync(configPath)) {
      const current = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      current.deviceToken = null;
      delete current.storeId;
      fs.writeFileSync(configPath, JSON.stringify(current, null, 2), 'utf8');
      console.log('[Main] Cleared connector pairing config directly on disk.');
    }
    return true;
  } catch (err) {
    console.error('[Main] Failed to clear config on disk:', err);
    return false;
  }
});



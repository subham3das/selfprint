import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell, Notification } from 'electron';
import path from 'path';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Register custom URL protocol scheme: selfprint://
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('selfprint', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('selfprint');
}

// Ensure single instance lock for deep linking
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();

      // Find deep link in arguments (e.g. selfprint://printers)
      const url = commandLine.find((arg) => arg.startsWith('selfprint://'));
      if (url) {
        handleDeepLink(url);
      }
    }
  });
}

function handleDeepLink(url: string): void {
  try {
    const parsed = new URL(url);
    const hostOrPath = parsed.host || parsed.pathname.replace(/^\/\//, '');

    const tabMap: Record<string, string> = {
      open: 'dashboard',
      dashboard: 'dashboard',
      printers: 'printers',
      notifications: 'notifications',
      activity: 'activity',
      settings: 'settings',
      about: 'about'
    };

    const targetTab = tabMap[hostOrPath.toLowerCase()] || 'dashboard';
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('navigate-tab', targetTab);
    }
  } catch (err) {
    console.error('Failed to parse deep link:', url, err);
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
    width: 1080,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#090d16',
    icon: icon,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    // Check initial launch argv for deep link
    const initialUrl = process.argv.find((arg) => arg.startsWith('selfprint://'));
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
  handleDeepLink(url);
});

app.whenReady().then(() => {
  createWindow();
  createTray();

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

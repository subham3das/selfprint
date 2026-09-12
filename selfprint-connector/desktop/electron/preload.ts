import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  openExternal: (url: string) => void;
  openPath: (dirPath: string) => void;
  showNotification: (title: string, body: string) => void;
  onNavigate: (callback: (tab: string) => void) => void;
  onTriggerAction: (callback: (action: string) => void) => void;
  getAutoStart: () => Promise<boolean>;
  setAutoStart: (enabled: boolean) => Promise<boolean>;
  openLogsFolder: () => void;
  openConfigFolder: () => void;
  saveConfig: (data: { deviceToken?: string; storeId?: string }) => Promise<boolean>;
  clearConfig: () => Promise<boolean>;
  checkForUpdates: () => Promise<any>;
  restartAndInstall: () => Promise<void>;
  getUpdateStatus: () => Promise<any>;
  onUpdateStatus: (callback: (status: any) => void) => () => void;
  saveAuth: (data: any) => Promise<boolean>;
  getAuth: () => Promise<any>;
  clearAuth: () => Promise<boolean>;
  logEvent: (tag: string, message: string) => void;
}

const api: ElectronAPI = {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  openExternal: (url: string) => ipcRenderer.send('open-external', url),
  openPath: (dirPath: string) => ipcRenderer.send('open-path', dirPath),
  showNotification: (title: string, body: string) => ipcRenderer.send('show-notification', { title, body }),
  onNavigate: (callback) => {
    ipcRenderer.on('navigate-tab', (_event, tab) => callback(tab));
  },
  onTriggerAction: (callback) => {
    ipcRenderer.on('trigger-action', (_event, action) => callback(action));
  },
  getAutoStart: () => ipcRenderer.invoke('get-auto-start'),
  setAutoStart: (enabled: boolean) => ipcRenderer.invoke('set-auto-start', enabled),
  openLogsFolder: () => ipcRenderer.send('open-logs-folder'),
  openConfigFolder: () => ipcRenderer.send('open-config-folder'),
  saveConfig: (data) => ipcRenderer.invoke('save-config', data),
  clearConfig: () => ipcRenderer.invoke('clear-config'),
  checkForUpdates: () => ipcRenderer.invoke('updater:check'),
  restartAndInstall: () => ipcRenderer.invoke('updater:restart'),
  getUpdateStatus: () => ipcRenderer.invoke('updater:get-status'),
  onUpdateStatus: (callback) => {
    const handler = (_event: any, status: any) => callback(status);
    ipcRenderer.on('updater:status-changed', handler);
    return () => {
      ipcRenderer.removeListener('updater:status-changed', handler);
    };
  },
  saveAuth: (data: any) => ipcRenderer.invoke('auth:save', data),
  getAuth: () => ipcRenderer.invoke('auth:get'),
  clearAuth: () => ipcRenderer.invoke('auth:clear'),
  logEvent: (tag: string, message: string) => ipcRenderer.send('log:event', { tag, message })
};

contextBridge.exposeInMainWorld('electronAPI', api);

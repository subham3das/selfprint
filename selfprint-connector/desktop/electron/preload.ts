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
  }
};

contextBridge.exposeInMainWorld('electronAPI', api);

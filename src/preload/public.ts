import { contextBridge, ipcRenderer } from 'electron';

// Solo se importa 'electron': los preloads con sandbox no pueden requerir otros módulos.
contextBridge.exposeInMainWorld('emeve', {
  getConfig: () => ipcRenderer.invoke('config:get'),
  log: (level: 'info' | 'warn' | 'error', message: string) => ipcRenderer.send('log', level, message),
});

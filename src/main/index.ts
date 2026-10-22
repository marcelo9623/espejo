import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'node:path';
import { loadConfig } from './config';
import { log } from './logger';
import type { LogLevel } from '../shared/types';

const DEV_URL = process.env.VITE_DEV_SERVER_URL;
let win: BrowserWindow | null = null;

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

function createWindow(): void {
  const cfg = loadConfig();
  const kiosk = cfg.kiosk || process.env.EMEVE_KIOSK === '1';

  win = new BrowserWindow({
    width: 540,
    height: 960,
    backgroundColor: '#07090F',
    show: false,
    kiosk,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'public.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once('ready-to-show', () => win?.show());

  // Bloquea navegación fuera de la app.
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  // Atajo temporal de salida hasta que exista el panel con PIN (Etapa 7).
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.control && input.shift && input.key.toLowerCase() === 'q') {
      e.preventDefault();
      app.quit();
    }
  });

  // Recuperación: si el renderer muere, se recarga sin cerrar la aplicación.
  win.webContents.on('render-process-gone', (_e, details) => {
    log('error', `Renderer terminó (${details.reason}); recargando.`);
    setTimeout(() => win?.reload(), 1000);
  });

  if (DEV_URL) void win.loadURL(DEV_URL);
  else void win.loadFile(path.join(__dirname, '..', 'renderer-public', 'index.html'));

  win.on('closed', () => (win = null));
}

app.whenReady().then(() => {
  // Solo se concede cámara a la propia aplicación.
  session.defaultSession.setPermissionRequestHandler((_wc, permission, cb) => cb(permission === 'media'));
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => permission === 'media');

  ipcMain.handle('config:get', () => loadConfig());
  ipcMain.on('log', (_e, level: LogLevel, message: unknown) => {
    const lv: LogLevel = level === 'warn' || level === 'error' ? level : 'info';
    log(lv, `[renderer] ${String(message).slice(0, 500)}`);
  });

  createWindow();
  log('info', `EMEVE ${app.getVersion()} iniciado`);
});

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});
app.on('window-all-closed', () => app.quit());
process.on('uncaughtException', (err) => log('error', `uncaughtException: ${err.stack ?? err}`));

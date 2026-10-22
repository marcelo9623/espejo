import type { AppConfig } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  event: { name: 'Nuestro evento', names: 'Novia & Novio', date: '' },
  startMessage: 'Toca la pantalla para comenzar',
  welcomeMessage: '¡Prepárate para sonreír!',
  camera: { deviceId: null, width: 1080, height: 1920, mirrorPreview: true },
  kiosk: false,
  idleResetSeconds: 10,
};

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, d: string, max = 120) =>
  typeof v === 'string' ? v.slice(0, max) : d;
const bool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);
const num = (v: unknown, d: number, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : d;

/** Valida datos desconocidos (archivo corrupto, versión antigua) y devuelve una configuración segura. */
export function mergeConfig(raw: unknown): AppConfig {
  const d = DEFAULT_CONFIG;
  if (!isObj(raw)) return structuredClone(d);
  const ev = isObj(raw.event) ? raw.event : {};
  const cam = isObj(raw.camera) ? raw.camera : {};
  return {
    event: {
      name: str(ev.name, d.event.name),
      names: str(ev.names, d.event.names),
      date: typeof ev.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ev.date) ? ev.date : d.event.date,
    },
    startMessage: str(raw.startMessage, d.startMessage),
    welcomeMessage: str(raw.welcomeMessage, d.welcomeMessage),
    camera: {
      deviceId: typeof cam.deviceId === 'string' && cam.deviceId ? cam.deviceId : null,
      width: num(cam.width, d.camera.width, 320, 7680),
      height: num(cam.height, d.camera.height, 240, 7680),
      mirrorPreview: bool(cam.mirrorPreview, d.camera.mirrorPreview),
    },
    kiosk: bool(raw.kiosk, d.kiosk),
    idleResetSeconds: num(raw.idleResetSeconds, d.idleResetSeconds, 3, 600),
  };
}

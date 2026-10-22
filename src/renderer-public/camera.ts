import type { AppConfig } from '../shared/types';

export type CameraState =
  | { kind: 'starting' }
  | { kind: 'live'; label: string; width: number; height: number }
  | { kind: 'error'; title: string; detail: string };

type Listener = (s: CameraState) => void;
type Logger = (lvl: 'info' | 'warn' | 'error', msg: string) => void;

export function describeCameraError(err: unknown): { title: string; detail: string } {
  const name = err instanceof DOMException ? err.name : '';
  switch (name) {
    case 'NotAllowedError':
      return { title: 'Sin permiso para usar la cámara', detail: 'Permite el acceso a la cámara en la configuración del sistema (Windows: Privacidad > Cámara; macOS: Privacidad y seguridad > Cámara).' };
    case 'NotFoundError':
      return { title: 'No se encontró ninguna cámara', detail: 'Conecta la cámara por USB y comprueba que el sistema la reconoce. Se reintentará automáticamente.' };
    case 'NotReadableError':
      return { title: 'La cámara está ocupada', detail: 'Otra aplicación (Zoom, EOS Utility, navegador) puede estar usándola. Ciérrala y se reintentará automáticamente.' };
    case 'OverconstrainedError':
      return { title: 'La cámara no admite esa configuración', detail: 'Cambia la resolución en la configuración.' };
    default:
      return { title: 'No se pudo iniciar la cámara', detail: String(err instanceof Error ? err.message : err) };
  }
}

export class CameraController {
  private stream: MediaStream | null = null;
  private retryTimer: number | undefined;
  private running = false;
  private cfg: AppConfig['camera'] | null = null;

  constructor(private video: HTMLVideoElement, private onState: Listener, private onLog: Logger) {
    navigator.mediaDevices.addEventListener('devicechange', () => {
      if (this.running && !this.stream) void this.retryNow();
    });
  }

  async start(cfg: AppConfig['camera']): Promise<void> {
    this.cfg = cfg;
    this.running = true;
    await this.open();
  }

  retryNow(): Promise<void> {
    window.clearTimeout(this.retryTimer);
    return this.open();
  }

  stop(): void {
    this.running = false;
    window.clearTimeout(this.retryTimer);
    this.release();
  }

  private release(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.video.srcObject = null;
  }

  private async open(): Promise<void> {
    if (!this.cfg || !this.running) return;
    this.release();
    this.onState({ kind: 'starting' });
    const { deviceId, width, height } = this.cfg;
    const base = { width: { ideal: width }, height: { ideal: height } };
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: deviceId ? { ...base, deviceId: { exact: deviceId } } : base, audio: false });
      } catch (e) {
        // Dispositivo guardado ya no existe: se usa la cámara predeterminada.
        if (deviceId && e instanceof DOMException && e.name === 'OverconstrainedError') {
          this.onLog('warn', 'Cámara configurada no disponible; usando la predeterminada.');
          stream = await navigator.mediaDevices.getUserMedia({ video: base, audio: false });
        } else throw e;
      }
      this.stream = stream;
      this.video.srcObject = stream;
      await this.video.play();
      const track = stream.getVideoTracks()[0];
      const s = track.getSettings();
      track.addEventListener('ended', () => {
        this.onLog('warn', 'La cámara se desconectó.');
        this.release();
        this.fail(new DOMException('desconectada', 'NotFoundError'));
      });
      this.onLog('info', `Cámara activa: ${track.label} ${s.width}x${s.height}`);
      this.onState({ kind: 'live', label: track.label, width: s.width ?? 0, height: s.height ?? 0 });
    } catch (e) {
      this.fail(e);
    }
  }

  private fail(err: unknown): void {
    const d = describeCameraError(err);
    this.onLog('error', `Cámara: ${d.title} (${String(err)})`);
    this.onState({ kind: 'error', ...d });
    if (this.running) {
      window.clearTimeout(this.retryTimer);
      this.retryTimer = window.setTimeout(() => void this.open(), 3000);
    }
  }
}

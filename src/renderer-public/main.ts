import type { PublicApi } from '../shared/types';
import { CameraController } from './camera';

declare global { interface Window { emeve: PublicApi } }

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const HOLD_MS = 250;      // un roce involuntario dura menos y se ignora
const LOCKOUT_MS = 1500;  // bloqueo tras volver al inicio

async function boot(): Promise<void> {
  const cfg = await window.emeve.getConfig();
  const video = $<HTMLVideoElement>('preview');
  const home = $('home'), welcome = $('welcome'), ring = $('touch-ring');
  const status = $('camera-status');

  video.classList.toggle('mirror', cfg.camera.mirrorPreview);
  $('names').textContent = cfg.event.names;
  $('event-name').textContent = cfg.event.name;
  $('event-date').textContent = cfg.event.date
    ? new Intl.DateTimeFormat('es-CL', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${cfg.event.date}T00:00:00Z`))
    : '';
  $('start-message').textContent = cfg.startMessage;
  $('welcome-message').textContent = cfg.welcomeMessage;

  const camera = new CameraController(
    video,
    (s) => {
      status.hidden = s.kind !== 'error';
      if (s.kind === 'error') {
        $('status-title').textContent = s.title;
        $('status-detail').textContent = s.detail;
      }
    },
    (lvl, msg) => window.emeve.log(lvl, msg),
  );
  $('status-retry').addEventListener('click', () => void camera.retryNow());
  void camera.start(cfg.camera);

  // --- Inicio -> bienvenida, con protección contra toques involuntarios ---
  let lockedUntil = 0;
  let holdTimer: number | undefined;
  let idleTimer: number | undefined;

  const goHome = () => {
    window.clearTimeout(idleTimer);
    welcome.hidden = true;
    home.hidden = false;
    lockedUntil = performance.now() + LOCKOUT_MS;
  };

  const goWelcome = () => {
    home.hidden = true;
    welcome.hidden = false;
    const ms = cfg.idleResetSeconds * 1000;
    $('timer-bar').animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: ms, fill: 'forwards' });
    idleTimer = window.setTimeout(goHome, ms);
  };

  const cancelHold = () => { window.clearTimeout(holdTimer); ring.hidden = true; };

  home.addEventListener('pointerdown', (e) => {
    if (performance.now() < lockedUntil || !status.hidden) return;
    ring.style.left = `${e.clientX}px`;
    ring.style.top = `${e.clientY}px`;
    ring.style.setProperty('--hold', `${HOLD_MS}ms`);
    ring.hidden = false;
    ring.style.animation = 'none'; void ring.offsetWidth; ring.style.animation = '';
    holdTimer = window.setTimeout(() => { cancelHold(); goWelcome(); }, HOLD_MS);
  });
  home.addEventListener('pointerup', cancelHold);
  home.addEventListener('pointercancel', cancelHold);
  home.addEventListener('pointerleave', cancelHold);
}

boot().catch((e) => {
  window.emeve?.log('error', `Fallo al iniciar la interfaz: ${String(e)}`);
  document.body.textContent = 'Error al iniciar. Revisa el registro de la aplicación.';
});

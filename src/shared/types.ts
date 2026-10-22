export interface AppConfig {
  event: { name: string; names: string; date: string };
  startMessage: string;
  welcomeMessage: string;
  camera: { deviceId: string | null; width: number; height: number; mirrorPreview: boolean };
  kiosk: boolean;
  idleResetSeconds: number;
}

export type LogLevel = 'info' | 'warn' | 'error';

export interface PublicApi {
  getConfig(): Promise<AppConfig>;
  log(level: LogLevel, message: string): void;
}

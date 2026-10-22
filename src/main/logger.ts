import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import type { LogLevel } from '../shared/types';

export function log(level: LogLevel, message: string): void {
  try {
    const dir = path.join(app.getPath('userData'), 'logs');
    fs.mkdirSync(dir, { recursive: true });
    const now = new Date();
    const file = path.join(dir, `emeve-${now.toISOString().slice(0, 10)}.log`);
    fs.appendFileSync(file, `${now.toISOString()} [${level}] ${message}\n`);
  } catch {
    // El registro nunca debe tumbar la aplicación.
  }
  if (level === 'error') console.error(message);
  else console.log(`[${level}] ${message}`);
}

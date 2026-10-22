import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_CONFIG, mergeConfig } from '../shared/config-logic';
import type { AppConfig } from '../shared/types';
import { log } from './logger';

const file = () => path.join(app.getPath('userData'), 'config.json');

export function loadConfig(): AppConfig {
  try {
    return mergeConfig(JSON.parse(fs.readFileSync(file(), 'utf8')));
  } catch (e) {
    const missing = (e as NodeJS.ErrnoException).code === 'ENOENT';
    if (!missing) log('warn', `config.json ilegible, usando valores por defecto: ${String(e)}`);
    const cfg = structuredClone(DEFAULT_CONFIG);
    if (missing) saveConfig(cfg);
    return cfg;
  }
}

/** Escritura atómica: archivo temporal + renombrado. */
export function saveConfig(cfg: AppConfig): void {
  const target = file();
  const tmp = `${target}.tmp`;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify(cfg, null, 2));
  fs.renameSync(tmp, target);
}

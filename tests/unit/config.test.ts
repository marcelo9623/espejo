import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, mergeConfig } from '../../src/shared/config-logic';

describe('mergeConfig', () => {
  it('devuelve los valores por defecto con datos inválidos', () => {
    expect(mergeConfig(null)).toEqual(DEFAULT_CONFIG);
    expect(mergeConfig('x')).toEqual(DEFAULT_CONFIG);
    expect(mergeConfig([])).toEqual(DEFAULT_CONFIG);
  });
  it('limita números fuera de rango', () => {
    const c = mergeConfig({ idleResetSeconds: 99999, camera: { width: -5, height: 'a' } });
    expect(c.idleResetSeconds).toBe(600);
    expect(c.camera.width).toBe(320);
    expect(c.camera.height).toBe(DEFAULT_CONFIG.camera.height);
  });
  it('rechaza fechas con formato incorrecto', () => {
    expect(mergeConfig({ event: { date: '12/05/2026' } }).event.date).toBe('');
    expect(mergeConfig({ event: { date: '2026-05-12' } }).event.date).toBe('2026-05-12');
  });
  it('conserva valores válidos y completa los que faltan', () => {
    const c = mergeConfig({ startMessage: 'Hola', camera: { mirrorPreview: false } });
    expect(c.startMessage).toBe('Hola');
    expect(c.camera.mirrorPreview).toBe(false);
    expect(c.camera.width).toBe(1080);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  COLOR_SCHEME_KEY,
  colorSchemeInlineScript,
  colorSchemeInlineScriptSha256,
  migrateLegacyColorScheme,
  mvv42ColorSchemeManager,
  removeLegacyAuthKeys,
} from '../src';

afterEach(() => {
  document.documentElement.removeAttribute('data-mantine-color-scheme');
});

describe('mvv42ColorSchemeManager (standalone)', () => {
  it('returns the default when nothing is stored, then persists set()', () => {
    const m = mvv42ColorSchemeManager({ embedded: false });
    expect(m.get('auto')).toBe('auto');
    m.set('dark');
    expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBe('dark');
    expect(m.get('auto')).toBe('dark');
    m.clear();
    expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBeNull();
  });

  it('ignores invalid stored values', () => {
    localStorage.setItem(COLOR_SCHEME_KEY, 'purple');
    expect(mvv42ColorSchemeManager({ embedded: false }).get('light')).toBe('light');
  });

  it('follows storage events for the shared key only', () => {
    const m = mvv42ColorSchemeManager({ embedded: false });
    const onUpdate = vi.fn();
    m.subscribe(onUpdate);
    window.dispatchEvent(new StorageEvent('storage', { key: 'other', newValue: 'dark' }));
    window.dispatchEvent(new StorageEvent('storage', { key: COLOR_SCHEME_KEY, newValue: 'nope' }));
    window.dispatchEvent(new StorageEvent('storage', { key: COLOR_SCHEME_KEY, newValue: 'dark' }));
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith('dark');
    m.unsubscribe();
    window.dispatchEvent(new StorageEvent('storage', { key: COLOR_SCHEME_KEY, newValue: 'light' }));
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });
});

describe('mvv42ColorSchemeManager (inside the shell)', () => {
  it('reads the shared key but never writes it (THEME is not persisted)', () => {
    localStorage.setItem(COLOR_SCHEME_KEY, 'auto');
    const m = mvv42ColorSchemeManager({ embedded: true });
    expect(m.get('light')).toBe('auto');
    m.set('dark');
    expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBe('auto');
    m.clear();
    expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBe('auto');
  });

  it('still follows the shell writing the key', () => {
    const m = mvv42ColorSchemeManager({ embedded: true });
    const onUpdate = vi.fn();
    m.subscribe(onUpdate);
    window.dispatchEvent(new StorageEvent('storage', { key: COLOR_SCHEME_KEY, newValue: 'light' }));
    expect(onUpdate).toHaveBeenCalledWith('light');
    m.unsubscribe();
  });
});

describe('legacy migration', () => {
  it('copies the Mantine key into the shared key and keeps the legacy key', () => {
    localStorage.setItem('mantine-color-scheme-value', 'dark');
    migrateLegacyColorScheme();
    expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBe('dark');
    expect(localStorage.getItem('mantine-color-scheme-value')).toBe('dark');
  });

  it('does nothing inside the shell (the shell owns the setting)', () => {
    localStorage.setItem('mantine-color-scheme-value', 'dark');
    migrateLegacyColorScheme({ embedded: true });
    expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBeNull();
    mvv42ColorSchemeManager({ embedded: true }).get('auto');
    expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBeNull();
  });

  it('migrates cashpulse-settings.colorScheme (zustand persist) and keeps the settings', () => {
    localStorage.setItem(
      'cashpulse-settings',
      JSON.stringify({ state: { colorScheme: 'light', currency: 'RUB' }, version: 0 }),
    );
    migrateLegacyColorScheme();
    expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBe('light');
    expect(localStorage.getItem('cashpulse-settings')).toContain('currency');
  });

  it('never overwrites an existing shared value', () => {
    localStorage.setItem(COLOR_SCHEME_KEY, 'auto');
    localStorage.setItem('mantine-color-scheme-value', 'dark');
    migrateLegacyColorScheme();
    expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBe('auto');
  });

  it('removes legacy auth token stores only', () => {
    for (const k of ['cashpulse-auth', 'bonds-auth', 'credit-calc-auth', 'keep-me']) localStorage.setItem(k, 'x');
    removeLegacyAuthKeys();
    expect(Object.keys(localStorage)).toEqual(['keep-me']);
  });
});

describe('colorSchemeInlineScript', () => {
  const run = () => new Function(colorSchemeInlineScript)();

  it('applies the stored scheme before paint', () => {
    localStorage.setItem(COLOR_SCHEME_KEY, 'dark');
    run();
    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('dark');
  });

  it('resolves auto via prefers-color-scheme', () => {
    localStorage.setItem(COLOR_SCHEME_KEY, 'auto');
    const original = window.matchMedia;
    window.matchMedia = (() => ({ matches: true })) as unknown as typeof window.matchMedia;
    try {
      run();
      expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('dark');
    } finally {
      window.matchMedia = original;
    }
  });

  it('falls back to the legacy Mantine key', () => {
    localStorage.setItem('mantine-color-scheme-value', 'light');
    run();
    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('light');
  });

  it('falls back to cashpulse-settings.colorScheme', () => {
    localStorage.setItem('cashpulse-settings', JSON.stringify({ state: { colorScheme: 'dark' }, version: 0 }));
    run();
    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('dark');
  });

  it('survives malformed cashpulse-settings', () => {
    localStorage.setItem('cashpulse-settings', '{oops');
    expect(run).not.toThrow();
    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('light');
  });

  it('exports a CSP hash that matches the script', async () => {
    const { createHash } = await import('node:crypto');
    const expected = `sha256-${createHash('sha256').update(colorSchemeInlineScript, 'utf8').digest('base64')}`;
    expect(colorSchemeInlineScriptSha256).toBe(expected);
  });

  it('reads the shared key', () => {
    expect(colorSchemeInlineScript).toContain(`'${COLOR_SCHEME_KEY}'`);
  });
});

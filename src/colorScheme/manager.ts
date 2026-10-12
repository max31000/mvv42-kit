import type { MantineColorScheme, MantineColorSchemeManager } from '@mantine/core';
import { COLOR_SCHEME_KEY, LEGACY_AUTH_KEYS, isStoredColorScheme } from './constants';
import { isInsideShell } from '../platform/shell';

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

/**
 * One-time migration of legacy colour-scheme keys into `mvv42-color-scheme` (only if the new key is absent):
 * `mantine-color-scheme-value` (Mantine default key; removed afterwards) and `cashpulse-settings.colorScheme`
 * (zustand-persist JSON; the settings object itself is left alone). Idempotent.
 */
export function migrateLegacyColorScheme(): void {
  const s = storage();
  if (!s) return;
  try {
    const current = s.getItem(COLOR_SCHEME_KEY);
    const legacyMantine = s.getItem('mantine-color-scheme-value');
    if (!isStoredColorScheme(current)) {
      let migrated: string | null = isStoredColorScheme(legacyMantine) ? legacyMantine : null;
      if (!migrated) {
        const raw = s.getItem('cashpulse-settings');
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as { colorScheme?: unknown; state?: { colorScheme?: unknown } };
            const value = parsed?.state?.colorScheme ?? parsed?.colorScheme;
            if (isStoredColorScheme(value)) migrated = value;
          } catch {
            /* not JSON — ignore */
          }
        }
      }
      if (migrated) s.setItem(COLOR_SCHEME_KEY, migrated);
    }
    if (legacyMantine !== null) s.removeItem('mantine-color-scheme-value');
  } catch {
    /* storage blocked */
  }
}

/** Removes the token stores of the pre-shared-auth logins (`cashpulse-auth`, `bonds-auth`, `credit-calc-auth`). */
export function removeLegacyAuthKeys(): void {
  const s = storage();
  if (!s) return;
  for (const key of LEGACY_AUTH_KEYS) {
    try {
      s.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

export interface Mvv42ColorSchemeManagerOptions {
  /**
   * Treat this document as embedded in the shell. Defaults to `isInsideShell()`. Embedded documents read the
   * shared key and follow `storage` events, but never write it: the shell owns the setting, and the resolved
   * `THEME` it posts is applied to the attribute only.
   */
  embedded?: boolean;
}

/**
 * Mantine colour-scheme manager on the shared `mvv42-color-scheme` key.
 *  - standalone: get/set/clear the key; follow changes made in other tabs (`storage` event);
 *  - inside the shell (iframe): read-only — `set` keeps the value in memory, so the shell's `THEME` never
 *    persists from inside a service, while the shell's own writes still arrive through `storage` events.
 */
export function mvv42ColorSchemeManager(options: Mvv42ColorSchemeManagerOptions = {}): MantineColorSchemeManager {
  let handler: ((event: StorageEvent) => void) | null = null;
  const embedded = () => options.embedded ?? isInsideShell();

  return {
    get(defaultValue: MantineColorScheme): MantineColorScheme {
      migrateLegacyColorScheme();
      const s = storage();
      try {
        const value = s?.getItem(COLOR_SCHEME_KEY);
        return isStoredColorScheme(value) ? value : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    set(value: MantineColorScheme): void {
      if (embedded()) return;
      try {
        storage()?.setItem(COLOR_SCHEME_KEY, value);
      } catch {
        /* storage blocked — keep in memory only */
      }
    },
    subscribe(onUpdate: (colorScheme: MantineColorScheme) => void): void {
      if (typeof window === 'undefined') return;
      handler = (event: StorageEvent) => {
        if (event.key !== COLOR_SCHEME_KEY) return;
        if (event.storageArea && event.storageArea !== storage()) return;
        if (isStoredColorScheme(event.newValue)) onUpdate(event.newValue);
      };
      window.addEventListener('storage', handler);
    },
    unsubscribe(): void {
      if (handler && typeof window !== 'undefined') window.removeEventListener('storage', handler);
      handler = null;
    },
    clear(): void {
      if (embedded()) return;
      try {
        storage()?.removeItem(COLOR_SCHEME_KEY);
      } catch {
        /* ignore */
      }
    },
  };
}

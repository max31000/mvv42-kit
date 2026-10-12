/** One colour-scheme setting for the shell and every service (same origin → same localStorage). */
export const COLOR_SCHEME_KEY = 'mvv42-color-scheme';

/** Keys older frontends used for the colour scheme; migrated once into `COLOR_SCHEME_KEY`. */
export const LEGACY_COLOR_SCHEME_KEYS = ['mantine-color-scheme-value', 'cashpulse-settings'] as const;

/** Token stores of the pre-shared-auth logins; removed on startup by `Mvv42Provider`. */
export const LEGACY_AUTH_KEYS = ['cashpulse-auth', 'bonds-auth', 'credit-calc-auth'] as const;

export type StoredColorScheme = 'light' | 'dark' | 'auto';

export function isStoredColorScheme(value: unknown): value is StoredColorScheme {
  return value === 'light' || value === 'dark' || value === 'auto';
}

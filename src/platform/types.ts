/** Contract of `GET /auth/api/me` (mvv42-auth). */

export type AppAccessMode = 'public' | 'invite' | 'admin';

export interface AppAccess {
  id: string;
  /** The app opens without login; login only unlocks extra features. */
  anonymous: boolean;
  access: AppAccessMode;
  /** The current user may use the app's authenticated features. */
  granted: boolean;
}

export interface Mvv42User {
  id: number;
  telegramId: number;
  name: string;
  username: string | null;
  photoUrl: string | null;
  /** May use `access=admin` apps. */
  isAdmin: boolean;
  /** Platform owner (sees the admin console). */
  isOwner: boolean;
}

export interface Me {
  /** `null` = anonymous visitor. */
  user: Mvv42User | null;
  apps: AppAccess[];
}

/** Shell ↔ service postMessage protocol. Services send READY/NAVIGATE/AUTH_REQUIRED; the shell sends THEME/AUTH_CHANGED. */
export type ShellMessage =
  | { type: 'READY'; serviceId: string }
  | { type: 'NAVIGATE'; serviceId: string; path: string }
  | { type: 'AUTH_REQUIRED'; serviceId: string }
  | { type: 'THEME'; scheme: 'light' | 'dark' }
  | { type: 'AUTH_CHANGED' };

/** Error thrown by `apiJson` for any non-2xx response. `code` comes from the `{ "error": "<code>" }` body. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(status: number, code: string | null, message?: string) {
    super(message ?? (code ? `${code} (HTTP ${status})` : `HTTP ${status}`));
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

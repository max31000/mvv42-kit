import { ApiError, type Me } from './types';
import { postToShell } from './shell';

export const AUTH_API = '/auth/api';

/** Fired on `window` after a local logout so `useMe` instances re-read `/me`. */
export const AUTH_CHANGED_EVENT = 'mvv42:auth-changed';

let refreshInFlight: Promise<boolean> | null = null;

/**
 * POST /auth/api/refresh, at most one at a time: in-memory single-flight inside this document, plus the
 * `mvv42-refresh` Web Lock across every same-origin tab and iframe when the Locks API exists (the refresh
 * cookie is shared, so parallel refreshes would race on token rotation). Resolves `true` when refreshed.
 */
export function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    const run = (): Promise<boolean> =>
      fetch(`${AUTH_API}/refresh`, { method: 'POST', credentials: 'same-origin' }).then(
        (r) => r.ok,
        () => false,
      );
    const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
    const attempt: Promise<boolean> =
      locks && typeof locks.request === 'function'
        ? Promise.resolve(locks.request('mvv42-refresh', run)).then((ok) => Boolean(ok), () => run())
        : run();
    refreshInFlight = attempt.finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/**
 * `fetch` for the service's own API: sends cookies (same-origin); on 401 refreshes the session once (shared
 * with concurrent callers) and retries the request once. Returns the raw `Response`. Request bodies must be
 * re-sendable (string, FormData, Blob, URLSearchParams or a `Request` — not a one-shot stream).
 */
export async function mvv42Fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const retryInput = input instanceof Request ? input.clone() : input;
  const options: RequestInit = { credentials: 'same-origin', ...init };

  const response = await fetch(input, options);
  if (response.status !== 401) return response;
  if (!(await refreshSession())) return response;
  return fetch(retryInput, options);
}

async function errorCode(response: Response): Promise<string | null> {
  try {
    const text = await response.text();
    if (!text) return null;
    const body = JSON.parse(text) as { error?: unknown };
    return typeof body?.error === 'string' ? body.error : null;
  } catch {
    return null;
  }
}

/**
 * JSON over `mvv42Fetch`. Throws `ApiError { status, code, message }` on non-2xx (`code` from `{ error }`),
 * resolves `undefined` for 204/empty bodies. A string body gets `Content-Type: application/json` unless set.
 */
export async function apiJson<T = unknown>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (typeof init?.body === 'string' && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await mvv42Fetch(input, { ...init, headers });
  if (!response.ok) {
    const code = await errorCode(response);
    throw new ApiError(response.status, code, code ?? (response.statusText || `HTTP ${response.status}`));
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/**
 * GET /auth/api/me (the server refreshes implicitly). `null` = auth unavailable (network error or non-200);
 * `{ user: null, apps }` = anonymous visitor.
 */
export async function getMe(): Promise<Me | null> {
  try {
    const response = await fetch(`${AUTH_API}/me`, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    if (!response.ok) return null;
    const me = (await response.json()) as Me;
    if (!me || typeof me !== 'object' || !Array.isArray(me.apps)) return null;
    return { user: me.user ?? null, apps: me.apps };
  } catch {
    return null;
  }
}

/**
 * The shell accepts a same-origin path starting with `/` but not `//` or `/\`: leading slashes collapse to
 * one; anything with a backslash falls back to `/`.
 */
export function safeReturnPath(path: string): string {
  if (path.includes('\\')) return '/';
  return '/' + path.replace(/^\/+/, '');
}

/** Login UI lives in the shell: inside it, ask the shell; standalone, go to `/?login=1&return=<path>`. */
export function requestLogin(serviceId: string): void {
  if (postToShell({ type: 'AUTH_REQUIRED', serviceId })) return;
  const { pathname, search, hash } = window.location;
  window.location.assign('/?login=1&return=' + encodeURIComponent(safeReturnPath(pathname + search + hash)));
}

/** POST /auth/api/logout, then tells local `useMe` instances to re-read `/me`. Never throws. */
export async function logout(): Promise<void> {
  try {
    await fetch(`${AUTH_API}/logout`, { method: 'POST', credentials: 'same-origin' });
  } catch {
    /* offline — cookies stay; /me re-read will show the truth */
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

/** Test hook: forget an in-flight refresh. */
export function __resetRefreshForTests(): void {
  refreshInFlight = null;
}

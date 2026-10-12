import { ApiError, type Me } from './types';
import { postToShell } from './shell';

export const AUTH_API = '/auth/api';

/** Fired on `window` after a local logout so `useMe` instances re-read `/me`. */
export const AUTH_CHANGED_EVENT = 'mvv42:auth-changed';
/** BroadcastChannel that tells other same-origin documents (tabs, iframes) that the session changed. */
export const AUTH_CHANNEL = 'mvv42-auth';
/** localStorage key pinged when BroadcastChannel is unavailable (the `storage` event reaches other documents). */
export const AUTH_STORAGE_EVENT_KEY = 'mvv42-auth-event';
/** Upper bound for POST /auth/api/refresh. */
const REFRESH_TIMEOUT_MS = 10_000;

function timeoutSignal(ms: number): AbortSignal | undefined {
  return typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(ms) : undefined;
}

/** Tells other same-origin documents that the session changed (logout, login elsewhere). */
export function broadcastAuthChanged(): void {
  try {
    if (typeof BroadcastChannel === 'function') {
      const channel = new BroadcastChannel(AUTH_CHANNEL);
      channel.postMessage({ type: 'AUTH_CHANGED' });
      channel.close();
      return;
    }
  } catch {
    /* fall through to storage */
  }
  try {
    localStorage.setItem(AUTH_STORAGE_EVENT_KEY, String(Date.now()));
    localStorage.removeItem(AUTH_STORAGE_EVENT_KEY);
  } catch {
    /* storage blocked */
  }
}

/** Subscribes to `broadcastAuthChanged` from other documents. Returns an unsubscribe function. */
export function onAuthBroadcast(handler: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const offs: Array<() => void> = [];
  try {
    if (typeof BroadcastChannel === 'function') {
      const channel = new BroadcastChannel(AUTH_CHANNEL);
      const listener = () => handler();
      channel.addEventListener('message', listener);
      offs.push(() => {
        channel.removeEventListener('message', listener);
        channel.close();
      });
    }
  } catch {
    /* ignore */
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === AUTH_STORAGE_EVENT_KEY && event.newValue) handler();
  };
  window.addEventListener('storage', onStorage);
  offs.push(() => window.removeEventListener('storage', onStorage));
  return () => offs.forEach((off) => off());
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * POST /auth/api/refresh, at most one at a time: in-memory single-flight inside this document, plus the
 * `mvv42-refresh` Web Lock across every same-origin tab and iframe when the Locks API exists (the refresh
 * cookie is shared, so parallel refreshes would race on token rotation). Resolves `true` when refreshed.
 */
export function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    const run = (): Promise<boolean> =>
      fetch(`${AUTH_API}/refresh`, {
        method: 'POST',
        credentials: 'same-origin',
        signal: timeoutSignal(REFRESH_TIMEOUT_MS),
      }).then(
        (r) => r.ok,
        () => false,
      );
    const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
    let attempt: Promise<boolean>;
    if (locks && typeof locks.request === 'function') {
      try {
        attempt = Promise.resolve(locks.request('mvv42-refresh', run)).then(
          (ok) => Boolean(ok),
          () => run(),
        );
      } catch {
        attempt = run();
      }
    } else {
      attempt = run();
    }
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
  const isRequest = typeof Request !== 'undefined' && input instanceof Request;
  const retryInput = isRequest ? (input as Request).clone() : input;
  // A Request carries its own credentials/headers; only plain URLs get the same-origin default.
  const options: RequestInit | undefined = isRequest ? init : { credentials: 'same-origin', ...init };

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
  const isRequest = typeof Request !== 'undefined' && input instanceof Request;
  const headers = new Headers(isRequest ? (input as Request).headers : undefined);
  new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (typeof init?.body === 'string' && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await mvv42Fetch(input, { ...init, headers });
  if (!response.ok) {
    const code = await errorCode(response);
    throw new ApiError(response.status, code, code ?? (response.statusText || `HTTP ${response.status}`));
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(response.status, 'invalid_json', 'Сервер вернул не JSON');
  }
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
 * The shell accepts a same-origin path starting with `/` but not `//` or `/\`: any leading run of slashes and
 * backslashes collapses to a single `/`, so the path can never read as protocol-relative. The rest is kept.
 */
export function safeReturnPath(path: string): string {
  return '/' + path.replace(/^[\\/]+/, '');
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
  broadcastAuthChanged();
}

/** Test hook: forget an in-flight refresh. */
export function __resetRefreshForTests(): void {
  refreshInFlight = null;
}

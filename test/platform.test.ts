import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  apiJson,
  getMe,
  isInsideShell,
  logout,
  mvv42Fetch,
  onShellMessage,
  parseShellMessage,
  refreshSession,
  requestLogin,
  safeReturnPath,
} from '../src/platform';
import { __resetRefreshForTests } from '../src/platform/client';
import { embedInShell, jsonResponse, postFrom } from './helpers';

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  __resetRefreshForTests();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

describe('refreshSession', () => {
  it('is single-flight within the page (no Locks API)', async () => {
    vi.stubGlobal('navigator', { ...navigator, locks: undefined });
    const d = deferred<Response>();
    fetchMock.mockReturnValueOnce(d.promise);
    const a = refreshSession();
    const b = refreshSession();
    expect(a).toBe(b);
    d.resolve(new Response(null, { status: 204 }));
    await expect(a).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/auth/api/refresh',
      { method: 'POST', credentials: 'same-origin' },
    );
  });

  it('runs under the mvv42-refresh Web Lock when available', async () => {
    const request = vi.fn((_name: string, cb: () => Promise<boolean>) => cb());
    vi.stubGlobal('navigator', { ...navigator, locks: { request } });
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
    await expect(refreshSession()).resolves.toBe(false);
    expect(request).toHaveBeenCalledWith('mvv42-refresh', expect.any(Function));
  });

  it('falls back to a plain refresh when the lock request fails', async () => {
    const request = vi.fn(() => Promise.reject(new Error('locks disabled')));
    vi.stubGlobal('navigator', { ...navigator, locks: { request } });
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));
    await expect(refreshSession()).resolves.toBe(true);
  });

  it('starts a new refresh after the previous one settled', async () => {
    vi.stubGlobal('navigator', { ...navigator, locks: undefined });
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    await refreshSession();
    await refreshSession();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('falls back to a plain refresh when locks.request throws synchronously', async () => {
    const request = vi.fn(() => {
      throw new Error('SecurityError');
    });
    vi.stubGlobal('navigator', { ...navigator, locks: { request } });
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));
    await expect(refreshSession()).resolves.toBe(true);
  });

  it('treats a network error as failure', async () => {
    vi.stubGlobal('navigator', { ...navigator, locks: undefined });
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    await expect(refreshSession()).resolves.toBe(false);
  });
});

describe('mvv42Fetch', () => {
  beforeEach(() => vi.stubGlobal('navigator', { ...navigator, locks: undefined }));

  it('sends cookies and returns non-401 responses as is', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: 1 }));
    const r = await mvv42Fetch('/api/x');
    expect(r.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith('/api/x', { credentials: 'same-origin' });
  });

  it('refreshes once on 401 and retries once', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 })) // refresh
      .mockResolvedValueOnce(jsonResponse(200, { ok: 1 }));
    const r = await mvv42Fetch('/api/x', { method: 'POST', body: '{}' });
    expect(r.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][1]).toMatchObject({ method: 'POST', body: '{}', credentials: 'same-origin' });
  });

  it('shares one refresh between concurrent 401s', async () => {
    const d = deferred<Response>();
    fetchMock.mockImplementation((input) => {
      if (input === '/auth/api/refresh') return d.promise;
      return Promise.resolve(new Response(null, { status: fetchMock.mock.calls.length <= 2 ? 401 : 200 }));
    });
    const p = Promise.all([mvv42Fetch('/api/a'), mvv42Fetch('/api/b')]);
    await new Promise((r) => setTimeout(r, 0));
    d.resolve(new Response(null, { status: 200 }));
    await p;
    expect(fetchMock.mock.calls.filter(([u]) => u === '/auth/api/refresh')).toHaveLength(1);
  });

  it('returns the 401 when the refresh fails (no retry)', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }));
    const r = await mvv42Fetch('/api/x');
    expect(r.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('apiJson', () => {
  beforeEach(() => vi.stubGlobal('navigator', { ...navigator, locks: undefined }));

  it('parses JSON and sets JSON headers for string bodies', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: 7 }));
    await expect(apiJson<{ id: number }>('/api/x', { method: 'POST', body: '{"a":1}' })).resolves.toEqual({ id: 7 });
    const headers = fetchMock.mock.calls[0][1]?.headers as Headers;
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('Accept')).toBe('application/json');
  });

  it('returns undefined for 204', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(apiJson('/api/x', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('throws ApiError with the code from { error }', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(404, { error: 'user_not_found' }));
    const err = await apiJson('/api/x').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 404, code: 'user_not_found', message: 'user_not_found' });
  });

  it('throws ApiError with code null for non-JSON errors', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>Bad gateway</html>', { status: 502, statusText: 'Bad Gateway' }));
    const err = await apiJson('/api/x').catch((e: unknown) => e);
    expect(err).toMatchObject({ status: 502, code: null, message: 'Bad Gateway' });
  });

  it('throws 401 after a failed refresh', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    await expect(apiJson('/api/x')).rejects.toMatchObject({ status: 401 });
  });
});

describe('getMe', () => {
  it('returns the anonymous shape (user: null) on 200', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { user: null, apps: [{ id: 'a', anonymous: true, access: 'public', granted: false }] }));
    await expect(getMe()).resolves.toEqual({ user: null, apps: [{ id: 'a', anonymous: true, access: 'public', granted: false }] });
  });

  it('returns the user on 200', async () => {
    const user = { id: 1, telegramId: 2, name: 'M', username: null, photoUrl: null, isAdmin: true, isOwner: true };
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { user, apps: [] }));
    await expect(getMe()).resolves.toEqual({ user, apps: [] });
  });

  it('returns null when auth is unavailable (non-200 or network error or bad shape)', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }));
    await expect(getMe()).resolves.toBeNull();
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    await expect(getMe()).resolves.toBeNull();
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { hello: 1 }));
    await expect(getMe()).resolves.toBeNull();
  });
});

describe('logout', () => {
  it('posts /auth/api/logout and notifies local listeners, never throws', async () => {
    const listener = vi.fn();
    window.addEventListener('mvv42:auth-changed', listener);
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    await expect(logout()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith('/auth/api/logout', { method: 'POST', credentials: 'same-origin' });
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener('mvv42:auth-changed', listener);
  });
});

describe('shell protocol', () => {
  it('is standalone in a top-level window', () => {
    expect(isInsideShell()).toBe(false);
  });

  it('treats a cross-origin parent as not-a-shell', () => {
    const { restore } = embedInShell('https://evil.example');
    expect(isInsideShell()).toBe(false);
    restore();
  });

  it('accepts only same-origin messages from the parent window', () => {
    const { parent, restore } = embedInShell();
    const handler = vi.fn();
    const off = onShellMessage(handler);

    postFrom(parent, { type: 'THEME', scheme: 'dark' }, 'https://evil.example'); // wrong origin
    postFrom({}, { type: 'THEME', scheme: 'dark' }); // wrong source
    postFrom(parent, { type: 'THEME', scheme: 'sepia' }); // invalid payload
    postFrom(parent, 'AUTH_CHANGED'); // not an object
    expect(handler).not.toHaveBeenCalled();

    postFrom(parent, { type: 'THEME', scheme: 'dark', extra: 1 });
    postFrom(parent, { type: 'AUTH_CHANGED' });
    expect(handler.mock.calls).toEqual([[{ type: 'THEME', scheme: 'dark' }], [{ type: 'AUTH_CHANGED' }]]);

    off();
    postFrom(parent, { type: 'AUTH_CHANGED' });
    expect(handler).toHaveBeenCalledTimes(2);
    restore();
  });

  it('ignores everything standalone', () => {
    const handler = vi.fn();
    const off = onShellMessage(handler);
    postFrom(window, { type: 'AUTH_CHANGED' });
    expect(handler).not.toHaveBeenCalled();
    off();
  });

  it('validates every message type', () => {
    expect(parseShellMessage({ type: 'NAVIGATE', serviceId: 'x', path: '/a?b=1' })).toEqual({
      type: 'NAVIGATE',
      serviceId: 'x',
      path: '/a?b=1',
    });
    expect(parseShellMessage({ type: 'NAVIGATE', serviceId: 'x', path: 'https://evil' })).toBeNull();
    expect(parseShellMessage({ type: 'READY', serviceId: '' })).toBeNull();
    expect(parseShellMessage({ type: 'AUTH_REQUIRED', serviceId: 'bonds' })).toEqual({ type: 'AUTH_REQUIRED', serviceId: 'bonds' });
    expect(parseShellMessage({ type: 'NOPE' })).toBeNull();
  });

  it('requestLogin asks the shell inside the iframe, pinned to our origin', () => {
    const { parent, restore } = embedInShell();
    requestLogin('bonds');
    expect(parent.postMessage).toHaveBeenCalledWith({ type: 'AUTH_REQUIRED', serviceId: 'bonds' }, window.location.origin);
    restore();
  });

  it('safeReturnPath collapses protocol-relative paths', () => {
    expect(safeReturnPath('//evil.example/x')).toBe('/evil.example/x');
    expect(safeReturnPath('/bonds/positions?x=1#h')).toBe('/bonds/positions?x=1#h');
    expect(safeReturnPath('/\\evil')).toBe('/evil');
    expect(safeReturnPath('\\/\\evil.example')).toBe('/evil.example');
    expect(safeReturnPath('/bonds/a\\b?q=c\\d')).toBe('/bonds/a\\b?q=c\\d');
  });
});

describe('v0.1.1 review fixes', () => {
  beforeEach(() => vi.stubGlobal('navigator', { ...navigator, locks: undefined }));

  it('apiJson: a non-JSON 2xx body throws ApiError invalid_json', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>spa fallback</html>', { status: 200 }));
    const err = await apiJson('/api/x').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 200, code: 'invalid_json' });
  });

  it('apiJson keeps headers of a Request input and adds Accept', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));
    await apiJson(new Request('http://localhost/api/x', { headers: { 'X-Trace': 'abc' } }));
    const headers = fetchMock.mock.calls[0][1]?.headers as Headers;
    expect(headers.get('X-Trace')).toBe('abc');
    expect(headers.get('Accept')).toBe('application/json');
  });

  it('mvv42Fetch does not override the credentials of a Request input', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));
    const req = new Request('http://localhost/api/x', { credentials: 'include' });
    await mvv42Fetch(req);
    expect(fetchMock.mock.calls[0][1]?.credentials).toBeUndefined();
  });

  it('logout broadcasts to other documents', async () => {
    const posted: unknown[] = [];
    class FakeChannel {
      constructor(public name: string) {}
      postMessage(m: unknown) {
        posted.push([this.name, m]);
      }
      close() {}
      addEventListener() {}
      removeEventListener() {}
    }
    vi.stubGlobal('BroadcastChannel', FakeChannel);
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await logout();
    expect(posted).toEqual([['mvv42-auth', { type: 'AUTH_CHANGED' }]]);
  });

  it('logout falls back to a storage ping without BroadcastChannel', async () => {
    vi.stubGlobal('BroadcastChannel', undefined);
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await logout();
    expect(setItem).toHaveBeenCalledWith('mvv42-auth-event', expect.any(String));
    setItem.mockRestore();
  });
});

describe('refresh timeout works with any fetch implementation (jsdom + undici)', () => {
  beforeEach(() => vi.stubGlobal('navigator', { ...navigator, locks: undefined }));

  it('never hands a foreign AbortSignal to fetch', async () => {
    // Node's fetch rejects jsdom's AbortSignal ("Expected signal to be an instance of AbortSignal").
    fetchMock.mockImplementation((_input, init) =>
      init?.signal ? Promise.reject(new TypeError('Expected signal to be an instance of AbortSignal')) : Promise.resolve(new Response(null, { status: 200 })),
    );
    await expect(refreshSession()).resolves.toBe(true);
  });

  it('gives up after 10 s when the server never answers', async () => {
    vi.useFakeTimers();
    try {
      fetchMock.mockImplementation(() => new Promise<Response>(() => undefined));
      const result = refreshSession();
      await vi.advanceTimersByTimeAsync(10_000);
      await expect(result).resolves.toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});

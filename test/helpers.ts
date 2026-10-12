import { vi } from 'vitest';

/** Makes this jsdom window look embedded in a same-origin shell iframe. Returns the fake parent and a restore fn. */
export function embedInShell(origin = window.location.origin) {
  const parent = {
    location: { origin },
    postMessage: vi.fn(),
  };
  Object.defineProperty(window, 'parent', { value: parent, configurable: true });
  return {
    parent,
    restore: () => Object.defineProperty(window, 'parent', { value: window, configurable: true }),
  };
}

/** Dispatches a `message` event with an arbitrary source/origin (jsdom validates `source` in the ctor). */
export function postFrom(source: unknown, data: unknown, origin = window.location.origin) {
  const event = new MessageEvent('message', { data, origin });
  Object.defineProperty(event, 'source', { value: source });
  window.dispatchEvent(event);
}

export function jsonResponse(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

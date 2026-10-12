import type { ShellMessage } from './types';

/**
 * The shell window when this document runs inside the shell's same-origin iframe, otherwise null.
 * A cross-origin parent (someone else framing the page) is not a shell.
 */
export function shellWindow(): Window | null {
  if (typeof window === 'undefined') return null;
  try {
    if (window.parent === window) return null;
    // Throws for a cross-origin parent.
    return window.parent.location.origin === window.location.origin ? window.parent : null;
  } catch {
    return null;
  }
}

/** `true` when the page runs inside the mvv42 shell. */
export function isInsideShell(): boolean {
  return shellWindow() !== null;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function nonEmpty(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

/** Validates an untrusted postMessage payload; returns a clean copy or null. */
export function parseShellMessage(data: unknown): ShellMessage | null {
  if (!isRecord(data)) return null;
  switch (data.type) {
    case 'THEME':
      return data.scheme === 'light' || data.scheme === 'dark' ? { type: 'THEME', scheme: data.scheme } : null;
    case 'AUTH_CHANGED':
      return { type: 'AUTH_CHANGED' };
    case 'READY':
      return nonEmpty(data.serviceId) ? { type: 'READY', serviceId: data.serviceId } : null;
    case 'AUTH_REQUIRED':
      return nonEmpty(data.serviceId) ? { type: 'AUTH_REQUIRED', serviceId: data.serviceId } : null;
    case 'NAVIGATE':
      return nonEmpty(data.serviceId) && typeof data.path === 'string' && data.path.startsWith('/')
        ? { type: 'NAVIGATE', serviceId: data.serviceId, path: data.path }
        : null;
    default:
      return null;
  }
}

/**
 * Subscribes to messages from the shell. Only same-origin messages whose source is the parent (shell) window
 * are accepted; payloads are validated. Returns an unsubscribe function. No-op standalone.
 */
export function onShellMessage(handler: (message: ShellMessage) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const listener = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    const shell = shellWindow();
    if (!shell || event.source !== shell) return;
    const message = parseShellMessage(event.data);
    if (message) handler(message);
  };
  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}

/** Posts a message to the shell, pinned to our own origin. Returns false when not inside the shell. */
export function postToShell(message: ShellMessage): boolean {
  const shell = shellWindow();
  if (!shell) return false;
  shell.postMessage(message, window.location.origin);
  return true;
}

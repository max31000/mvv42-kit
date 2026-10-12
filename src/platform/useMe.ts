import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { AUTH_CHANGED_EVENT, getMe } from './client';
import { onShellMessage } from './shell';
import type { AppAccess, Me, Mvv42User } from './types';

export type MeStatus = 'loading' | 'unavailable' | 'anonymous' | 'authenticated';

interface MeSnapshot {
  me: Me | null;
  loaded: boolean;
  status: MeStatus;
}

const listeners = new Set<() => void>();
let snapshot: MeSnapshot = { me: null, loaded: false, status: 'loading' };
let inflight: Promise<Me | null> | null = null;
let detach: (() => void) | null = null;

function statusOf(me: Me | null): MeStatus {
  if (!me) return 'unavailable';
  return me.user ? 'authenticated' : 'anonymous';
}

function emit() {
  for (const l of listeners) l();
}

/** Re-reads `/auth/api/me` (deduplicated); every `useMe` re-renders with the result. */
export function reloadMe(): Promise<Me | null> {
  if (!inflight) {
    inflight = getMe()
      .then((me) => {
        snapshot = { me, loaded: true, status: statusOf(me) };
        emit();
        return me;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

function attach() {
  if (detach || typeof window === 'undefined') return;
  const onLocal = () => void reloadMe();
  const off = onShellMessage((m) => {
    if (m.type === 'AUTH_CHANGED') void reloadMe();
  });
  window.addEventListener(AUTH_CHANGED_EVENT, onLocal);
  detach = () => {
    off();
    window.removeEventListener(AUTH_CHANGED_EVENT, onLocal);
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  attach();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && detach) {
      detach();
      detach = null;
    }
  };
}

const getSnapshot = () => snapshot;

export interface UseMeResult {
  /** `null` while loading or when auth is unavailable. */
  me: Me | null;
  user: Mvv42User | null;
  /** True until the first `/me` answer. */
  loading: boolean;
  status: MeStatus;
  /** Access entry for an app id, if `/me` lists it. */
  app: (appId: string) => AppAccess | undefined;
  refresh: () => Promise<Me | null>;
}

/**
 * Current user and app access from `/auth/api/me`, shared by every component (one request). Re-reads on the
 * shell's `AUTH_CHANGED` and after `logout()`.
 */
export function useMe(): UseMeResult {
  const s = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => {
    if (!snapshot.loaded) void reloadMe();
  }, []);
  const app = useCallback((appId: string) => s.me?.apps.find((a) => a.id === appId), [s.me]);
  return { me: s.me, user: s.me?.user ?? null, loading: !s.loaded, status: s.status, app, refresh: reloadMe };
}

/** Test hook: reset the shared store. */
export function __resetMeForTests(): void {
  snapshot = { me: null, loaded: false, status: 'loading' };
  inflight = null;
  if (detach) detach();
  detach = null;
  listeners.clear();
}

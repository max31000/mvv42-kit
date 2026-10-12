import { useContext, useEffect, useRef } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { isInsideShell, onShellMessage, postToShell } from './platform/shell';
import { reloadMe } from './platform/useMe';
import { Mvv42Context } from './context';

/**
 * Shell bridge without a router (rendered by `Mvv42Provider`; call it yourself only with a custom provider):
 * announces `READY`, applies the shell's resolved `THEME` to the page (never persisted — see the colour-scheme
 * manager) and re-reads `/me` on `AUTH_CHANGED`. No-op standalone. Route sync lives in
 * `useShellRouterSync` (`@mvv42/kit/router`).
 */
export function useShellBridge(serviceId: string): void {
  const { setColorScheme } = useMantineColorScheme();
  // The provider's mode wins (it may be forced); without a provider fall back to window detection.
  const ctx = useContext(Mvv42Context);
  const embedded = ctx ? ctx.insideShell : isInsideShell();
  const setRef = useRef(setColorScheme);
  useEffect(() => {
    setRef.current = setColorScheme;
  }, [setColorScheme]);

  useEffect(() => {
    if (!embedded) return undefined;
    const off = onShellMessage((message) => {
      if (message.type === 'THEME') setRef.current(message.scheme);
      else if (message.type === 'AUTH_CHANGED') void reloadMe();
    });
    postToShell({ type: 'READY', serviceId });
    return off;
  }, [serviceId, embedded]);
}

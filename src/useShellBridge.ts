import { useEffect, useRef } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { isInsideShell, onShellMessage, postToShell } from './platform/shell';
import { reloadMe } from './platform/useMe';

/**
 * Shell bridge without a router (rendered by `Mvv42Provider`; call it yourself only with a custom provider):
 * announces `READY`, applies the shell's resolved `THEME` to the page (never persisted — see the colour-scheme
 * manager) and re-reads `/me` on `AUTH_CHANGED`. No-op standalone. Route sync lives in
 * `useShellRouterSync` (`@mvv42/kit/router`).
 */
export function useShellBridge(serviceId: string): void {
  const { setColorScheme } = useMantineColorScheme();
  const setRef = useRef(setColorScheme);
  useEffect(() => {
    setRef.current = setColorScheme;
  }, [setColorScheme]);

  useEffect(() => {
    if (!isInsideShell()) return undefined;
    const off = onShellMessage((message) => {
      if (message.type === 'THEME') setRef.current(message.scheme);
      else if (message.type === 'AUTH_CHANGED') void reloadMe();
    });
    postToShell({ type: 'READY', serviceId });
    return off;
  }, [serviceId]);
}

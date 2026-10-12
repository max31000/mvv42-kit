import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { postToShell } from '../platform/shell';

/**
 * Keeps the shell's address bar (`#/<serviceId><path>`) in sync with the router: posts `NAVIGATE` with the
 * router location (relative to its basename) on every change. No-op standalone. `AppLayout` calls it.
 */
export function useShellRouterSync(serviceId: string): void {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    const path = (pathname.startsWith('/') ? pathname : `/${pathname}`) + search + hash;
    postToShell({ type: 'NAVIGATE', serviceId, path });
  }, [serviceId, pathname, search, hash]);
}

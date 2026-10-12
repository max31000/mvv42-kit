/**
 * `@mvv42/kit/testing` — helpers for consumer unit tests (Vitest/Jest + @testing-library/react).
 *
 *   import { renderWithKit, resetNotifications } from '@mvv42/kit/testing';
 *   afterEach(resetNotifications);
 *   renderWithKit(<MyScreen />, { serviceId: 'bonds', accent: 'violet' });
 */
import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { notifications } from '@mantine/notifications';
import { Mvv42Provider, type Mvv42ProviderProps } from './Mvv42Provider';
import { __resetMeForTests } from './platform/useMe';
import { __resetRefreshForTests } from './platform/client';

export interface KitWrapperOptions extends Partial<Omit<Mvv42ProviderProps, 'children'>> {
  /** Extra wrapper inside the provider (e.g. a MemoryRouter). */
  wrapper?: (props: { children: ReactNode }) => ReactElement;
}

/** Wrapper component for `render`/`renderHook`: `Mvv42Provider` in test env (no transitions/portals), standalone. */
export function kitWrapper({ wrapper: Inner, serviceId = 'test', insideShell = false, env = 'test', ...rest }: KitWrapperOptions = {}) {
  return function KitWrapper({ children }: { children: ReactNode }) {
    return (
      <Mvv42Provider serviceId={serviceId} insideShell={insideShell} env={env} {...rest}>
        {Inner ? <Inner>{children}</Inner> : children}
      </Mvv42Provider>
    );
  };
}

export interface RenderWithKitOptions extends KitWrapperOptions, Omit<RenderOptions, 'wrapper'> {}

/** `render` inside `Mvv42Provider` (test env). */
export function renderWithKit(ui: ReactElement, options: RenderWithKitOptions = {}): RenderResult {
  const { serviceId, accent, theme, insideShell, env, notifications: n, wrapper, ...renderOptions } = options;
  return render(ui, {
    ...renderOptions,
    wrapper: kitWrapper({ serviceId, accent, theme, insideShell, env, notifications: n, wrapper }),
  });
}

/** Clears shown and queued Mantine notifications — call in `afterEach`. */
export function resetNotifications(): void {
  notifications.clean();
  notifications.cleanQueue();
}

/** Forgets the shared `/me` snapshot and any in-flight refresh — call in `afterEach` when tests mock `/auth/api/me`. */
export function resetKitState(): void {
  __resetMeForTests();
  __resetRefreshForTests();
}

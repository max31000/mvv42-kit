import { useMemo, useState, type ReactNode } from 'react';
import { MantineProvider, mergeThemeOverrides, type MantineThemeOverride } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Mvv42Context, type Mvv42ContextValue } from './context';
import { migrateLegacyColorScheme, mvv42ColorSchemeManager, removeLegacyAuthKeys } from './colorScheme/manager';
import { isInsideShell } from './platform/shell';
import { createMvv42Theme } from './theme/createMvv42Theme';
import { mvv42CssVariablesResolver } from './theme/cssVariablesResolver';
import { isMvv42Accent, type Mvv42Accent } from './theme/palette';
import { useShellBridge } from './useShellBridge';

export interface Mvv42ProviderProps {
  /** Registry id of the service (`cashpulse`, `bonds`, `credit_calc`, …). */
  serviceId: string;
  /** Primary colour; matches the service tile in the shell registry. Default `zinc`. */
  accent?: Mvv42Accent;
  /** Extra Mantine theme overrides, merged over the kit theme. */
  theme?: MantineThemeOverride;
  /** Force the embedded/standalone mode (playgrounds, tests). Detected automatically by default. */
  insideShell?: boolean;
  /** Props for `@mantine/core`'s `MantineProvider` `env` (use `'test'` in unit tests). */
  env?: 'default' | 'test';
  children?: ReactNode;
}

function ShellBridge({ serviceId }: { serviceId: string }) {
  useShellBridge(serviceId);
  return null;
}

function startup() {
  migrateLegacyColorScheme();
  removeLegacyAuthKeys();
}

/**
 * Root of every mvv42 frontend: MantineProvider with the kit theme for `accent`, the shared colour-scheme
 * manager (`mvv42-color-scheme`), the token remap (`cssVariablesResolver`), `Notifications`, the shell bridge
 * (READY / THEME / AUTH_CHANGED) and the kit context. Also removes legacy auth keys once on startup.
 * Does not render `ColorSchemeScript` — put `colorSchemeInlineScript` into `index.html` (`mvv42Html()`).
 */
export function Mvv42Provider({ serviceId, accent, theme, insideShell, env, children }: Mvv42ProviderProps) {
  useState(startup);
  const resolvedAccent: Mvv42Accent = isMvv42Accent(accent) ? accent : 'zinc';
  const [embedded] = useState(() => insideShell ?? isInsideShell());
  const [manager] = useState(() => mvv42ColorSchemeManager({ embedded }));

  const mergedTheme = useMemo(() => {
    const base = createMvv42Theme({ accent: resolvedAccent });
    return theme ? mergeThemeOverrides(base, theme) : base;
  }, [resolvedAccent, theme]);

  const ctx = useMemo<Mvv42ContextValue>(
    () => ({ serviceId, insideShell: embedded, accent: resolvedAccent }),
    [serviceId, embedded, resolvedAccent],
  );

  return (
    <MantineProvider
      theme={mergedTheme}
      colorSchemeManager={manager}
      defaultColorScheme="auto"
      cssVariablesResolver={mvv42CssVariablesResolver}
      env={env}
    >
      <Mvv42Context.Provider value={ctx}>
        <ShellBridge serviceId={serviceId} />
        <Notifications position={embedded ? 'top-center' : 'top-right'} limit={4} zIndex={400} />
        {children}
      </Mvv42Context.Provider>
    </MantineProvider>
  );
}

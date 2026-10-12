import { createContext, useContext } from 'react';
import type { Mvv42Accent } from './theme/palette';

export interface Mvv42ContextValue {
  /** Registry id of the service (`cashpulse`, `bonds`, …). */
  serviceId: string;
  /** True when rendered inside the mvv42 shell iframe. */
  insideShell: boolean;
  accent: Mvv42Accent;
}

export const Mvv42Context = createContext<Mvv42ContextValue | null>(null);

/** Service id, shell embedding and accent from the nearest `Mvv42Provider`. Throws outside a provider. */
export function useMvv42Context(): Mvv42ContextValue {
  const ctx = useContext(Mvv42Context);
  if (!ctx) throw new Error('useMvv42Context must be used inside <Mvv42Provider>');
  return ctx;
}

/** `true` when the service runs inside the mvv42 shell. */
export function useInsideShell(): boolean {
  const ctx = useContext(Mvv42Context);
  return ctx?.insideShell ?? false;
}

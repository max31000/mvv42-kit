/** WCAG 2 helpers used to pick legible shades at theme-build time. Hex input only (#rgb or #rrggbb). */

function channels(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  const n = Number.parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Surfaces text sits on (tokens `--mvv-surface`). */
export const SURFACE = { light: '#ffffff', dark: '#161618' } as const;

/**
 * Index of the shade used for coloured text (`c="green"`, light badges, alerts): the lightest shade from
 * index 6 upward that reaches 4.5:1 on the light surface; in dark, the lightest-index-preferred shade from 4
 * downward that reaches 4.5:1 on the dark surface.
 */
export function textShade(tuple: readonly string[], scheme: 'light' | 'dark'): number {
  if (scheme === 'light') {
    for (let i = 6; i <= 9; i += 1) if (contrastRatio(tuple[i], SURFACE.light) >= 4.5) return i;
    return 9;
  }
  for (let i = 4; i >= 0; i -= 1) if (contrastRatio(tuple[i], SURFACE.dark) >= 4.5) return i;
  return 0;
}

function toHex(rgb: [number, number, number]): string {
  return '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

/** Mixes `hex` towards black (`amount` > 0) or white (`amount` < 0) by |amount| in 0..1. */
export function shift(hex: string, amount: number): string {
  const target = amount > 0 ? 0 : 255;
  const a = Math.abs(amount);
  return toHex(channels(hex).map((c) => c + (target - c) * a) as [number, number, number]);
}

/**
 * Legible text colour for a tuple: `var(--mantine-color-<name>-<shade>)` when a shade reaches 4.5:1, otherwise
 * the closest shade (9 in light, 0 in dark) darkened/lightened just enough, as a hex literal.
 */
export function textColor(name: string, tuple: readonly string[], scheme: 'light' | 'dark'): { css: string; hex: string } {
  const i = textShade(tuple, scheme);
  const surface = SURFACE[scheme];
  if (contrastRatio(tuple[i], surface) >= 4.5) return { css: `var(--mantine-color-${name}-${i})`, hex: tuple[i] };
  let hex = tuple[i];
  for (let step = 0.05; step <= 1 && contrastRatio(hex, surface) < 4.5; step += 0.05) {
    hex = shift(tuple[i], scheme === 'light' ? step : -step);
  }
  return { css: hex, hex };
}

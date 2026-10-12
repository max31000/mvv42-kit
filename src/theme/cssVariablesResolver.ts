import type { CSSVariablesResolver, MantineTheme } from '@mantine/core';
import { filledHex, onColor, textColor } from './contrast';

/** Colours whose variant variables the kit re-tunes (everything but the `dark` surface scale). */
function tunableColors(theme: MantineTheme): string[] {
  return Object.keys(theme.colors).filter((name) => name !== 'dark' && Array.isArray(theme.colors[name]));
}

/**
 * Remaps Mantine's semantic variables onto the kit's `--mvv-*` tokens and re-tunes colour variants:
 *  - body/text/dimmed/borders/default surfaces → tokens (so every Mantine component sits on kit surfaces);
 *  - `light` variants (Badge, Alert, ThemeIcon, Button variant="light") become translucent tints that work on
 *    any surface in both schemes, with text in a shade that reaches 4.5:1;
 *  - `--mantine-color-<c>-text` (used by `c="green"` etc.) uses the same legible shade.
 * Mantine merges the result over its default resolver.
 */
export const mvv42CssVariablesResolver: CSSVariablesResolver = (theme) => {
  const light: Record<string, string> = {
    '--mantine-color-body': 'var(--mvv-bg)',
    '--mantine-color-text': 'var(--mvv-text)',
    '--mantine-color-bright': 'var(--mvv-text)',
    '--mantine-color-dimmed': 'var(--mvv-text-3)',
    '--mantine-color-placeholder': 'var(--mvv-text-3)',
    '--mantine-color-default': 'var(--mvv-surface)',
    '--mantine-color-default-hover': 'var(--mvv-surface-2)',
    '--mantine-color-default-color': 'var(--mvv-text)',
    '--mantine-color-default-border': 'var(--mvv-border-strong)',
    '--mantine-color-error': 'var(--mvv-danger)',
    '--mantine-color-success': 'var(--mvv-success)',
    '--mantine-color-disabled': 'var(--mvv-surface-2)',
    '--mantine-color-disabled-color': 'var(--mvv-text-3)',
    '--mantine-color-disabled-border': 'var(--mvv-border)',
  };
  const dark: Record<string, string> = { ...light };

  for (const name of tunableColors(theme)) {
    const tuple = theme.colors[name];
    const lt = textColor(name, tuple, 'light').css;
    const dt = textColor(name, tuple, 'dark').css;
    const base = `var(--mantine-color-${name}-6)`;
    const darkBase = `var(--mantine-color-${name}-5)`;
    light[`--mvv-on-${name}`] = onColor(filledHex(name, tuple, 'light'));
    dark[`--mvv-on-${name}`] = onColor(filledHex(name, tuple, 'dark'));
    Object.assign(light, {
      [`--mantine-color-${name}-text`]: lt,
      [`--mantine-color-${name}-light`]: `color-mix(in srgb, ${base} 11%, transparent)`,
      [`--mantine-color-${name}-light-hover`]: `color-mix(in srgb, ${base} 17%, transparent)`,
      [`--mantine-color-${name}-light-color`]: lt,
      [`--mantine-color-${name}-outline`]: lt,
      [`--mantine-color-${name}-outline-hover`]: `color-mix(in srgb, ${base} 7%, transparent)`,
    });
    Object.assign(dark, {
      [`--mantine-color-${name}-text`]: dt,
      [`--mantine-color-${name}-light`]: `color-mix(in srgb, ${darkBase} 15%, transparent)`,
      [`--mantine-color-${name}-light-hover`]: `color-mix(in srgb, ${darkBase} 22%, transparent)`,
      [`--mantine-color-${name}-light-color`]: dt,
      [`--mantine-color-${name}-outline`]: dt,
      [`--mantine-color-${name}-outline-hover`]: `color-mix(in srgb, ${darkBase} 10%, transparent)`,
    });
  }

  // Neutral (gray/zinc) chips read as quiet surfaces, not tinted ones.
  Object.assign(light, {
    '--mantine-color-gray-light': 'var(--mvv-surface-active)',
    '--mantine-color-gray-light-hover': 'rgba(24, 24, 27, 0.11)',
    '--mantine-color-gray-light-color': 'var(--mvv-text-2)',
    '--mantine-color-gray-text': 'var(--mvv-text-2)',
    '--mantine-color-gray-outline': 'var(--mvv-text-2)',
  });
  Object.assign(dark, {
    '--mantine-color-gray-light': 'var(--mvv-surface-active)',
    '--mantine-color-gray-light-hover': 'rgba(250, 250, 250, 0.14)',
    '--mantine-color-gray-light-color': 'var(--mvv-text-2)',
    '--mantine-color-gray-text': 'var(--mvv-text-2)',
    '--mantine-color-gray-outline': 'var(--mvv-text-2)',
  });

  // Neutral zinc fills are ink-coloured: #18181b on light, #fafafa on dark.
  if (theme.colors.zinc) {
    Object.assign(light, {
      '--mantine-color-zinc-filled': 'var(--mantine-color-zinc-9)',
      '--mantine-color-zinc-filled-hover': 'var(--mantine-color-zinc-8)',
    });
    Object.assign(dark, {
      '--mantine-color-zinc-filled': 'var(--mantine-color-zinc-0)',
      '--mantine-color-zinc-filled-hover': 'var(--mantine-color-zinc-2)',
    });
  }

  const primary = theme.primaryColor;
  light['--mantine-primary-color-contrast'] = `var(--mvv-on-${primary})`;
  dark['--mantine-primary-color-contrast'] = `var(--mvv-on-${primary})`;
  if (primary === 'zinc') {
    // Neutral accent: links read as text with an underline, not as a colour.
    light['--mantine-color-anchor'] = 'var(--mvv-text)';
    dark['--mantine-color-anchor'] = 'var(--mvv-text)';
  } else {
    light['--mantine-color-anchor'] = `var(--mantine-color-${primary}-text)`;
    dark['--mantine-color-anchor'] = `var(--mantine-color-${primary}-text)`;
  }

  return {
    variables: {
      '--mvv-accent': 'var(--mantine-primary-color-filled)',
      '--mvv-accent-hover': 'var(--mantine-primary-color-filled-hover)',
      '--mvv-accent-contrast': `var(--mvv-on-${primary})`,
      '--mvv-accent-text': `var(--mantine-color-${primary}-text)`,
    },
    light,
    dark,
  };
};

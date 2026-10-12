import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';
import { MVV42_ACCENTS, accentTuples, contrastRatio, createMvv42Theme, mvv42CssVariablesResolver } from '../src';
import { textColor } from '../src/theme/contrast';

const full = (accent: (typeof MVV42_ACCENTS)[number]) => mergeMantineTheme(DEFAULT_THEME, createMvv42Theme({ accent }));

describe('createMvv42Theme', () => {
  it('pins registry colours at index 6', () => {
    expect(accentTuples.blue[6]).toBe('#228be6');
    expect(accentTuples.green[6]).toBe('#40c057');
    expect(accentTuples.violet[6]).toBe('#7048e8');
  });

  it.each(MVV42_ACCENTS)('%s: primary colour, shades and auto contrast', (accent) => {
    const theme = full(accent);
    expect(theme.primaryColor).toBe(accent);
    expect(theme.autoContrast).toBe(true);
    expect(theme.respectReducedMotion).toBe(true);
    expect(theme.cursorType).toBe('pointer');
    expect(theme.colors[accent]).toHaveLength(10);
    expect(theme.primaryShade).toEqual(accent === 'zinc' ? { light: 9, dark: 0 } : { light: 6, dark: 5 });
  });

  it('uses zinc for gray and tokens for radius/shadows/fonts', () => {
    const theme = full('blue');
    expect(theme.colors.gray).toEqual(accentTuples.zinc);
    expect(theme.radius.md).toBe('var(--mvv-r-md)');
    expect(theme.shadows.sm).toBe('var(--mvv-shadow-sm)');
    expect(theme.fontFamily).toBe('var(--mvv-font-sans)');
  });

  it('falls back to zinc for an unknown accent', () => {
    // @ts-expect-error runtime guard
    expect(full('pink').primaryColor).toBe('zinc');
  });

  it('attaches kit class names to core components', () => {
    const theme = full('violet');
    expect(theme.components.Button.classNames).toMatchObject({ root: 'mvv-button' });
    expect(theme.components.Table.classNames).toMatchObject({ th: 'mvv-table-th' });
    expect(theme.components.DateInput).toBeTypeOf('object');
  });
});

describe('mvv42CssVariablesResolver', () => {
  it('remaps Mantine semantics onto kit tokens in both schemes', () => {
    const vars = mvv42CssVariablesResolver(full('green'));
    for (const scheme of [vars.light, vars.dark]) {
      expect(scheme['--mantine-color-body']).toBe('var(--mvv-bg)');
      expect(scheme['--mantine-color-text']).toBe('var(--mvv-text)');
      expect(scheme['--mantine-color-default-border']).toBe('var(--mvv-border-strong)');
      expect(scheme['--mantine-color-error']).toBe('var(--mvv-danger)');
    }
    expect(vars.variables['--mvv-accent']).toBe('var(--mantine-primary-color-filled)');
  });

  it('picks text shades with >= 4.5:1 on kit surfaces', () => {
    const theme = full('blue');
    for (const name of ['blue', 'green', 'violet', 'teal', 'orange', 'red', 'yellow', 'grape', 'cyan', 'lime', 'pink', 'indigo', 'gray', 'zinc']) {
      const tuple = theme.colors[name];
      expect(contrastRatio(textColor(name, tuple, 'light').hex, '#ffffff')).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(textColor(name, tuple, 'dark').hex, '#161618')).toBeGreaterThanOrEqual(4.5);
    }
  });
});

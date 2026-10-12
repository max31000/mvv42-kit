import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ActionIcon, Badge, Button, Checkbox, DEFAULT_THEME, SegmentedControl, Switch, ThemeIcon, mergeMantineTheme } from '@mantine/core';
import { MVV42_ACCENTS, Mvv42Provider, contrastRatio, createMvv42Theme, mvv42CssVariablesResolver } from '../src';
import { filledHex } from '../src/theme/contrast';

const SCHEMES = ['light', 'dark'] as const;
const OTHER_COLORS = ['gray', 'yellow', 'grape', 'cyan', 'lime', 'pink', 'indigo'];

function resolve(accent: (typeof MVV42_ACCENTS)[number]) {
  const theme = mergeMantineTheme(DEFAULT_THEME, createMvv42Theme({ accent }));
  return { theme, vars: mvv42CssVariablesResolver(theme) };
}

describe('filled labels are readable for every accent × scheme', () => {
  for (const accent of MVV42_ACCENTS) {
    for (const scheme of SCHEMES) {
      it(`${accent} / ${scheme}`, () => {
        const { theme, vars } = resolve(accent);
        for (const name of [accent, ...MVV42_ACCENTS, ...OTHER_COLORS]) {
          const fill = filledHex(name, theme.colors[name], scheme);
          const label = vars[scheme][`--mvv-on-${name}`];
          expect(label, `${name} on-colour`).toMatch(/^#[0-9a-f]{6}$/);
          expect(contrastRatio(label, fill), `${name} ${fill} vs ${label}`).toBeGreaterThanOrEqual(3);
        }
        expect(vars[scheme]['--mantine-primary-color-contrast']).toBe(`var(--mvv-on-${accent})`);
      });
    }
  }

  it('zinc fills are ink: #18181b on light, #fafafa on dark, with the opposite label', () => {
    const { vars } = resolve('zinc');
    expect(vars.light['--mantine-color-zinc-filled']).toBe('var(--mantine-color-zinc-9)');
    expect(vars.dark['--mantine-color-zinc-filled']).toBe('var(--mantine-color-zinc-0)');
    expect(vars.light['--mvv-on-zinc']).toBe('#ffffff');
    expect(vars.dark['--mvv-on-zinc']).toBe('#18181b');
  });

  it('non-primary colours keep their own shades in a zinc theme (red stays red in dark)', () => {
    const { theme } = resolve('zinc');
    expect(theme.primaryShade).toEqual({ light: 6, dark: 5 });
  });
});

describe('components use the scheme-aware on-colour', () => {
  for (const accent of MVV42_ACCENTS) {
    it(`${accent}: Button / ActionIcon / Badge / ThemeIcon / SegmentedControl / Checkbox / Switch`, () => {
      const { container, getByRole } = render(
        <Mvv42Provider serviceId="t" accent={accent} env="test">
          <Button>Primary</Button>
          <Button color="red">Red</Button>
          <Button variant="light">Light</Button>
          <ActionIcon variant="filled" color={accent} aria-label="ai" />
          <Badge variant="filled">Filled</Badge>
          <ThemeIcon variant="filled">i</ThemeIcon>
          <SegmentedControl color={accent} data={['a', 'b']} />
          <Checkbox label="c" defaultChecked />
          <Switch label="s" defaultChecked />
        </Mvv42Provider>,
      );
      const on = `var(--mvv-on-${accent})`;
      expect(getByRole('button', { name: 'Primary' }).style.getPropertyValue('--button-color')).toBe(on);
      expect(getByRole('button', { name: 'Red' }).style.getPropertyValue('--button-color')).toBe('var(--mvv-on-red)');
      expect(getByRole('button', { name: 'Light' }).style.getPropertyValue('--button-color')).not.toBe(on);
      expect(getByRole('button', { name: 'ai' }).style.getPropertyValue('--ai-color')).toBe(on);
      expect((container.querySelector('.mvv-badge') as HTMLElement).style.getPropertyValue('--badge-color')).toBe(on);
      expect((container.querySelector('.mantine-ThemeIcon-root') as HTMLElement).style.getPropertyValue('--ti-color')).toBe(on);
      expect((container.querySelector('.mvv-segmented') as HTMLElement).style.getPropertyValue('--sc-label-color')).toBe(on);
      expect(container.querySelector('[style*="--checkbox-icon-color"]')?.getAttribute('style')).toContain(on);
      expect(container.querySelector('[style*="--mvv-switch-on"]')?.getAttribute('style')).toContain(on);
      expect(container.querySelector('[data-with-thumb-indicator]')).toBeNull();
    });
  }
});

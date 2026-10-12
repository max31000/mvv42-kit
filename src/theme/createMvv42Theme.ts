import { createTheme, mergeThemeOverrides, type MantineTheme, type MantineThemeOverride } from '@mantine/core';
import { accentTuples, blue, dark, green, isMvv42Accent, orange, red, teal, violet, zinc, type Mvv42Accent } from './palette';

export interface CreateMvv42ThemeOptions {
  /** Primary colour of the service. `zinc` (neutral) is the shell's. Default `zinc`. */
  accent?: Mvv42Accent;
}

const comboboxClassNames = {
  dropdown: 'mvv-dropdown',
  option: 'mvv-option',
  options: 'mvv-options',
  empty: 'mvv-combobox-empty',
};

const inputDefaults = { size: 'sm' as const };

interface ColorProps {
  color?: unknown;
  variant?: unknown;
}

/**
 * `var(--mvv-on-<color>)` for a theme colour name (or the primary colour when none is given): the label colour
 * that stays readable on that colour's filled shade in the *current* scheme. Mantine's own autoContrast is
 * computed once in JS and cannot follow the scheme (zinc is #18181b in light and #fafafa in dark). Explicit
 * shades (`blue.7`) and CSS colours keep Mantine's behaviour.
 */
export function onColorVar(theme: MantineTheme, color: unknown): string | undefined {
  const name = color === undefined || color === null ? theme.primaryColor : color;
  if (typeof name !== 'string' || name === 'dark' || !(name in theme.colors)) return undefined;
  return `var(--mvv-on-${name})`;
}

const isFilled = (variant: unknown) => variant === undefined || variant === 'filled';

/** Builds a `vars` resolver that sets `cssVar` to the on-colour for filled variants. */
function filledLabel(...cssVars: string[]) {
  return (theme: MantineTheme, props: ColorProps) => {
    const on = isFilled(props.variant) ? onColorVar(theme, props.color) : undefined;
    return on ? { root: Object.fromEntries(cssVars.map((v) => [v, on])) } : { root: {} };
  };
}

/** Plain-object overrides for `@mantine/dates` (optional peer — never imported by the kit). */
const datesInput = {
  defaultProps: { ...inputDefaults, popoverProps: { shadow: 'lg', radius: 'md' } },
  classNames: { dropdown: 'mvv-dropdown' },
};

/**
 * Mantine theme of mvv42.ru: zinc neutrals, tokens for type/radius/shadow, one accent per service and
 * restrained component defaults (hairline borders instead of heavy shadows, sentence-case badges,
 * tabular numbers in tables). Pair with `mvv42CssVariablesResolver` (done by `Mvv42Provider`) and
 * `@mvv42/kit/styles.css`.
 */
export function createMvv42Theme(options: CreateMvv42ThemeOptions = {}): MantineThemeOverride {
  const accent: Mvv42Accent = isMvv42Accent(options.accent) ? options.accent : 'zinc';

  return createTheme({
    fontFamily: 'var(--mvv-font-sans)',
    fontFamilyMonospace: 'var(--mvv-font-mono)',
    headings: {
      fontFamily: 'var(--mvv-font-sans)',
      fontWeight: '600',
      textWrap: 'balance',
      sizes: {
        h1: { fontSize: 'var(--mvv-fs-28)', lineHeight: '1.2' },
        h2: { fontSize: 'var(--mvv-fs-22)', lineHeight: '1.25' },
        h3: { fontSize: 'var(--mvv-fs-17)', lineHeight: '1.3' },
        h4: { fontSize: 'var(--mvv-fs-15)', lineHeight: '1.35' },
        h5: { fontSize: 'var(--mvv-fs-14)', lineHeight: '1.4' },
        h6: { fontSize: 'var(--mvv-fs-13)', lineHeight: '1.4' },
      },
    },
    colors: {
      ...accentTuples,
      zinc,
      gray: zinc,
      dark,
      blue,
      green,
      violet,
      teal,
      orange,
      red,
    },
    primaryColor: accent,
    // One shade rule for every colour (Mantine applies primaryShade to all filled colours). The neutral zinc
    // accent still reads as #18181b / #fafafa: the resolver maps `--mantine-color-zinc-filled` to zinc 9 / 0.
    primaryShade: { light: 6, dark: 5 },
    autoContrast: true,
    luminanceThreshold: 0.3,
    white: '#ffffff',
    black: '#18181b',
    defaultRadius: 'sm',
    radius: {
      xs: 'var(--mvv-r-xs)',
      sm: 'var(--mvv-r-sm)',
      md: 'var(--mvv-r-md)',
      lg: 'var(--mvv-r-lg)',
      xl: 'var(--mvv-r-xl)',
    },
    fontSizes: {
      xs: 'var(--mvv-fs-12)',
      sm: 'var(--mvv-fs-13)',
      md: 'var(--mvv-fs-15)',
      lg: 'var(--mvv-fs-17)',
      xl: 'var(--mvv-fs-22)',
    },
    lineHeights: { xs: '1.4', sm: '1.45', md: '1.5', lg: '1.55', xl: '1.6' },
    shadows: {
      xs: 'var(--mvv-shadow-xs)',
      sm: 'var(--mvv-shadow-sm)',
      md: 'var(--mvv-shadow-md)',
      lg: 'var(--mvv-shadow-lg)',
      xl: 'var(--mvv-shadow-lg)',
    },
    cursorType: 'pointer',
    focusRing: 'auto',
    respectReducedMotion: true,
    other: { mvv42Accent: accent },

    components: {
      Button: {
        defaultProps: { size: 'sm' },
        classNames: { root: 'mvv-button', section: 'mvv-button-section' },
        vars: filledLabel('--button-color', '--button-hover-color'),
      },
      ActionIcon: {
        defaultProps: { variant: 'subtle', color: 'gray' },
        classNames: { root: 'mvv-action-icon' },
        vars: filledLabel('--ai-color', '--ai-hover-color'),
      },
      Paper: {
        defaultProps: { withBorder: true, radius: 'md' },
        classNames: { root: 'mvv-paper' },
      },
      Card: {
        defaultProps: { withBorder: true, radius: 'md', padding: 'lg' },
        classNames: { root: 'mvv-paper mvv-card', section: 'mvv-card-section' },
      },
      Table: {
        defaultProps: { verticalSpacing: 'xs', horizontalSpacing: 'sm', highlightOnHover: true },
        classNames: {
          table: 'mvv-table',
          thead: 'mvv-table-thead',
          th: 'mvv-table-th',
          td: 'mvv-table-td',
          tr: 'mvv-table-tr',
          caption: 'mvv-table-caption',
        },
      },
      Input: {
        classNames: { wrapper: 'mvv-input', input: 'mvv-input-field', section: 'mvv-input-section' },
      },
      InputWrapper: {
        classNames: {
          label: 'mvv-input-label',
          description: 'mvv-input-description',
          error: 'mvv-input-error',
          required: 'mvv-input-required',
        },
      },
      Select: {
        defaultProps: { ...inputDefaults, comboboxProps: { shadow: 'lg', radius: 'md' }, withCheckIcon: true },
        classNames: comboboxClassNames,
      },
      MultiSelect: {
        defaultProps: { ...inputDefaults, comboboxProps: { shadow: 'lg', radius: 'md' } },
        classNames: { ...comboboxClassNames, pill: 'mvv-pill' },
      },
      Autocomplete: {
        defaultProps: { ...inputDefaults, comboboxProps: { shadow: 'lg', radius: 'md' } },
        classNames: comboboxClassNames,
      },
      TagsInput: {
        defaultProps: { ...inputDefaults, comboboxProps: { shadow: 'lg', radius: 'md' } },
        classNames: { ...comboboxClassNames, pill: 'mvv-pill' },
      },
      DateInput: datesInput,
      DatePickerInput: datesInput,
      MonthPickerInput: datesInput,
      YearPickerInput: datesInput,
      DateTimePicker: datesInput,
      Modal: {
        defaultProps: {
          radius: 'lg',
          centered: true,
          overlayProps: { backgroundOpacity: 1, color: 'var(--mvv-scrim)', blur: 4 },
          transitionProps: { transition: 'pop', duration: 180 },
        },
        classNames: {
          content: 'mvv-modal-content',
          header: 'mvv-modal-header',
          title: 'mvv-modal-title',
          body: 'mvv-modal-body',
          close: 'mvv-modal-close',
        },
      },
      Drawer: {
        defaultProps: {
          overlayProps: { backgroundOpacity: 1, color: 'var(--mvv-scrim)', blur: 4 },
        },
        classNames: {
          content: 'mvv-modal-content mvv-drawer-content',
          header: 'mvv-modal-header',
          title: 'mvv-modal-title',
          body: 'mvv-modal-body',
          close: 'mvv-modal-close',
        },
      },
      Tabs: {
        classNames: { root: 'mvv-tabs', list: 'mvv-tabs-list', tab: 'mvv-tab', panel: 'mvv-tabs-panel' },
      },
      SegmentedControl: {
        defaultProps: { radius: 'sm', size: 'sm' },
        classNames: {
          root: 'mvv-segmented',
          indicator: 'mvv-segmented-indicator',
          label: 'mvv-segmented-label',
          control: 'mvv-segmented-control',
        },
        vars: (theme: MantineTheme, props: ColorProps) => {
          const on = props.color ? onColorVar(theme, props.color) : undefined;
          return { root: on ? { '--sc-label-color': on } : {} };
        },
      },
      Badge: {
        defaultProps: { variant: 'light', radius: 'xl' },
        classNames: { root: 'mvv-badge' },
        vars: (theme: MantineTheme, props: ColorProps) => {
          const on = props.variant === 'filled' ? onColorVar(theme, props.color) : undefined;
          return { root: on ? { '--badge-color': on } : {} };
        },
      },
      Tooltip: {
        defaultProps: { openDelay: 250, transitionProps: { transition: 'fade', duration: 120 }, radius: 'xs' },
        classNames: { tooltip: 'mvv-tooltip' },
      },
      Popover: {
        defaultProps: { shadow: 'lg', radius: 'md' },
        classNames: { dropdown: 'mvv-dropdown mvv-popover' },
      },
      Menu: {
        defaultProps: { shadow: 'lg', radius: 'md', transitionProps: { transition: 'pop-top-right', duration: 160 } },
        classNames: {
          dropdown: 'mvv-dropdown',
          item: 'mvv-menu-item',
          label: 'mvv-menu-label',
          divider: 'mvv-menu-divider',
          itemSection: 'mvv-menu-item-section',
        },
      },
      Notification: {
        defaultProps: { radius: 'md' },
        classNames: {
          root: 'mvv-notification',
          title: 'mvv-notification-title',
          description: 'mvv-notification-description',
          icon: 'mvv-notification-icon',
        },
      },
      Alert: {
        defaultProps: { variant: 'light', radius: 'md' },
        classNames: {
          root: 'mvv-alert',
          title: 'mvv-alert-title',
          message: 'mvv-alert-message',
          icon: 'mvv-alert-icon',
        },
      },
      Accordion: {
        classNames: {
          root: 'mvv-accordion',
          item: 'mvv-accordion-item',
          control: 'mvv-accordion-control',
          label: 'mvv-accordion-label',
          chevron: 'mvv-accordion-chevron',
          content: 'mvv-accordion-content',
        },
      },
      NavLink: {
        classNames: { root: 'mvv-navlink', label: 'mvv-navlink-label' },
      },
      Skeleton: {
        defaultProps: { radius: 'sm' },
        classNames: { root: 'mvv-skeleton' },
      },
      Loader: {
        defaultProps: { size: 'sm' },
      },
      Switch: {
        defaultProps: { size: 'sm', withThumbIndicator: false },
        classNames: { track: 'mvv-switch-track', thumb: 'mvv-switch-thumb', label: 'mvv-choice-label' },
        vars: (theme: MantineTheme, props: ColorProps) => {
          const on = onColorVar(theme, props.color);
          return { root: on ? { '--mvv-switch-on': on } : {} };
        },
      },
      Checkbox: {
        defaultProps: { radius: 'xs' },
        classNames: { input: 'mvv-checkbox-input', label: 'mvv-choice-label' },
        vars: filledLabel('--checkbox-icon-color'),
      },
      Radio: {
        classNames: { radio: 'mvv-radio', label: 'mvv-choice-label' },
        vars: filledLabel('--radio-icon-color'),
      },
      Progress: {
        defaultProps: { radius: 'xl', size: 'sm' },
        classNames: { root: 'mvv-progress' },
      },
      Pagination: {
        defaultProps: { size: 'sm', radius: 'sm' },
        classNames: { control: 'mvv-pagination-control' },
      },
      Divider: { classNames: { root: 'mvv-divider' } },
      Title: { classNames: { root: 'mvv-title' } },
      Anchor: { defaultProps: { underline: 'hover' }, classNames: { root: 'mvv-anchor mvv-link' } },
      Slider: {
        classNames: {
          root: 'mvv-slider',
          markWrapper: 'mvv-slider-mark-wrapper',
          markLabel: 'mvv-slider-mark-label',
          label: 'mvv-slider-label',
        },
      },
      ThemeIcon: {
        defaultProps: { variant: 'light', radius: 'sm' },
        vars: (theme: MantineTheme, props: ColorProps) => {
          const on = props.variant === 'filled' ? onColorVar(theme, props.color) : undefined;
          return { root: on ? { '--ti-color': on } : {} };
        },
      },
      Avatar: { defaultProps: { radius: 'xl' }, classNames: { root: 'mvv-avatar' } },
      Kbd: { classNames: { root: 'mvv-kbd' } },
      Code: { classNames: { root: 'mvv-code' } },
    },
  });
}

/** `createMvv42Theme` + your own overrides, merged (yours win). */
export function extendMvv42Theme(accent: Mvv42Accent, override?: MantineThemeOverride): MantineThemeOverride {
  const base = createMvv42Theme({ accent });
  return override ? mergeThemeOverrides(base, override) : base;
}

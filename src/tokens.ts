/**
 * Token references for inline styles and chart props, e.g. `style={{ color: tokens.text2 }}`.
 * Values are `var(--mvv-…)` strings — they follow the colour scheme automatically.
 */
export const tokens = {
  bg: 'var(--mvv-bg)',
  surface: 'var(--mvv-surface)',
  surface2: 'var(--mvv-surface-2)',
  surfaceHover: 'var(--mvv-surface-hover)',
  surfaceActive: 'var(--mvv-surface-active)',
  text: 'var(--mvv-text)',
  text2: 'var(--mvv-text-2)',
  text3: 'var(--mvv-text-3)',
  border: 'var(--mvv-border)',
  borderStrong: 'var(--mvv-border-strong)',
  focusRing: 'var(--mvv-focus-ring)',
  accent: 'var(--mvv-accent)',
  success: 'var(--mvv-success)',
  warning: 'var(--mvv-warning)',
  danger: 'var(--mvv-danger)',
  info: 'var(--mvv-info)',
  successBg: 'var(--mvv-success-bg)',
  warningBg: 'var(--mvv-warning-bg)',
  dangerBg: 'var(--mvv-danger-bg)',
  infoBg: 'var(--mvv-info-bg)',
  radiusSm: 'var(--mvv-r-sm)',
  radiusMd: 'var(--mvv-r-md)',
  radiusLg: 'var(--mvv-r-lg)',
  shadowSm: 'var(--mvv-shadow-sm)',
  shadowMd: 'var(--mvv-shadow-md)',
  fontMono: 'var(--mvv-font-mono)',
  contentMax: 'var(--mvv-content-max)',
  contentWide: 'var(--mvv-content-wide)',
} as const;

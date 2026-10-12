/**
 * `@mvv42/kit` — core: theme, provider, layout primitives and states. No react-router / recharts imports
 * (see `@mvv42/kit/router`, `@mvv42/kit/charts`). Styles: import `@mvv42/kit/styles.css` explicitly.
 */
export { createMvv42Theme, extendMvv42Theme } from './theme/createMvv42Theme';
export type { CreateMvv42ThemeOptions } from './theme/createMvv42Theme';
export { mvv42CssVariablesResolver } from './theme/cssVariablesResolver';
export { MVV42_ACCENTS, accentTuples, isMvv42Accent } from './theme/palette';
export type { Mvv42Accent } from './theme/palette';
export { contrastRatio } from './theme/contrast';
export { tokens } from './tokens';

export { COLOR_SCHEME_KEY, LEGACY_AUTH_KEYS, LEGACY_COLOR_SCHEME_KEYS } from './colorScheme/constants';
export { colorSchemeInlineScript, colorSchemeInlineScriptSha256 } from './colorScheme/inline';
export { migrateLegacyColorScheme, mvv42ColorSchemeManager, removeLegacyAuthKeys } from './colorScheme/manager';

export { Mvv42Provider } from './Mvv42Provider';
export type { Mvv42ProviderProps } from './Mvv42Provider';
export { useInsideShell, useMvv42Context } from './context';
export type { Mvv42ContextValue } from './context';
export { useShellBridge } from './useShellBridge';

export { Page } from './components/Page';
export type { PageProps } from './components/Page';
export { Section } from './components/Section';
export type { SectionPadding, SectionProps } from './components/Section';
export { Metric, MetricGrid } from './components/Metric';
export type { MetricDelta, MetricGridProps, MetricProps, MetricTone } from './components/Metric';
export { EmptyState, ErrorState } from './components/States';
export type { EmptyStateProps, ErrorStateProps } from './components/States';
export { AccountButton, ColorSchemeToggle, LoginRequired, UserAvatar } from './components/Account';
export type { LoginRequiredProps, UserAvatarProps } from './components/Account';
export { DataList, ListRow } from './components/DataList';
export type { DataListProps, ListRowProps } from './components/DataList';
export { TextLink } from './components/TextLink';
export type { TextLinkProps } from './components/TextLink';
export { safeAvatarUrl } from './components/avatarUrl';
export * as icons from './components/icons';

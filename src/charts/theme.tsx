import { useMediaQuery } from '@mantine/hooks';

/** Default chart height for page-level charts. */
export const CHART_HEIGHT = 300;
/** Height of compact dashboard charts and of every chart on phones. */
export const CHART_HEIGHT_COMPACT = 220;

const SERIES = [
  'var(--mvv-chart-1)',
  'var(--mvv-chart-2)',
  'var(--mvv-chart-3)',
  'var(--mvv-chart-4)',
  'var(--mvv-chart-5)',
  'var(--mvv-chart-6)',
  'var(--mvv-chart-7)',
  'var(--mvv-chart-8)',
] as const;

/**
 * Chart colours as CSS variables (follow light/dark automatically).
 * `series` is the validated categorical palette — assign in fixed order by entity, never cycle: a 9th series
 * folds into «Другое» (`other`). Semantic colours are for meaning (gain/loss), never for «series 4».
 */
export const chartColors = {
  series: SERIES,
  other: 'var(--mvv-text-3)',
  positive: 'var(--mvv-success)',
  negative: 'var(--mvv-danger)',
  warning: 'var(--mvv-warning)',
  info: 'var(--mvv-info)',
  neutral: 'var(--mvv-text-3)',
  accent: 'var(--mvv-accent)',
  grid: 'var(--mvv-border)',
  axis: 'var(--mvv-border-strong)',
  tick: 'var(--mvv-text-3)',
  text: 'var(--mvv-text-2)',
  surface: 'var(--mvv-surface)',
} as const;

/** Colour of the i-th series (0-based); past the 8th returns `chartColors.other`. */
export function seriesColor(index: number): string {
  return index >= 0 && index < SERIES.length ? SERIES[index] : chartColors.other;
}

export interface ChartThemeOptions {
  /** Desktop height. Default `CHART_HEIGHT`. Phones always get `CHART_HEIGHT_COMPACT` (or less). */
  height?: number;
}

/**
 * Recharts props that make every chart look the same: recessive grid and axes in token colours, 12px ticks,
 * legend on top with neutral text, thin lines with a surface ring on the active dot, rounded bar ends.
 * Spread them: `<CartesianGrid {...t.grid} />`, `<XAxis dataKey="m" {...t.xAxis} />`, `<Line {...t.line} />`.
 */
export function useChartTheme(options: ChartThemeOptions = {}) {
  const isCompact = useMediaQuery('(max-width: 48em)') ?? false;
  const desktopHeight = options.height ?? CHART_HEIGHT;
  const tick = { fill: chartColors.tick, fontSize: 12 };

  return {
    colors: chartColors,
    isCompact,
    height: isCompact ? Math.min(desktopHeight, CHART_HEIGHT_COMPACT + 20) : desktopHeight,
    /** Max X labels for `pickAxisTicks`. */
    maxTicks: isCompact ? 4 : 8,
    margin: { top: 8, right: 8, bottom: 0, left: 0 },
    grid: { stroke: chartColors.grid, strokeDasharray: '0', vertical: false },
    xAxis: {
      tick,
      tickLine: false,
      axisLine: { stroke: chartColors.axis },
      tickMargin: 8,
      minTickGap: 12,
    },
    yAxis: {
      tick,
      tickLine: false,
      axisLine: false,
      tickMargin: 6,
      width: 56,
    },
    legend: {
      verticalAlign: 'top' as const,
      align: 'left' as const,
      height: 32,
      iconType: 'circle' as const,
      iconSize: 8,
      /** Keep series in declaration order (Recharts 3 sorts alphabetically by default). */
      itemSorter: null,
      wrapperStyle: { fontSize: 12, lineHeight: '16px' },
      formatter: (value: unknown) => <span style={{ color: chartColors.text }}>{String(value)}</span>,
    },
    /** For line/area charts: hairline crosshair. */
    tooltip: {
      cursor: { stroke: chartColors.axis, strokeWidth: 1 },
      wrapperStyle: { outline: 'none' },
      isAnimationActive: false,
    },
    /** For bar charts: soft column highlight. */
    barTooltip: {
      cursor: { fill: 'var(--mvv-surface-hover)' },
      wrapperStyle: { outline: 'none' },
      isAnimationActive: false,
    },
    line: {
      strokeWidth: 2,
      dot: false,
      activeDot: { r: 4, strokeWidth: 2, stroke: chartColors.surface },
      type: 'monotone' as const,
    },
    area: {
      strokeWidth: 2,
      dot: false,
      activeDot: { r: 4, strokeWidth: 2, stroke: chartColors.surface },
      type: 'monotone' as const,
      fillOpacity: 0.12,
    },
    bar: {
      radius: [4, 4, 0, 0] as [number, number, number, number],
      maxBarSize: 36,
    },
  };
}

export type ChartTheme = ReturnType<typeof useChartTheme>;

/** Responsive height + tick budget (compat with the bonds chart kit). */
export function useResponsiveChartSize(desktopHeight: number = CHART_HEIGHT) {
  const isCompact = useMediaQuery('(max-width: 48em)') ?? false;
  return {
    height: isCompact ? Math.min(desktopHeight, CHART_HEIGHT_COMPACT + 20) : desktopHeight,
    maxTicks: isCompact ? 4 : 8,
    isCompact,
  };
}

/**
 * Thins category/date labels to about `maxTicks`, always keeping the last point. Use as `ticks` on `<XAxis>`.
 */
export function pickAxisTicks<T>(labels: T[], maxTicks = 8): T[] {
  if (labels.length <= maxTicks) return labels;
  const step = Math.ceil(labels.length / maxTicks);
  const picked: T[] = [];
  for (let i = 0; i < labels.length; i += step) picked.push(labels[i]);
  const last = labels[labels.length - 1];
  if (picked[picked.length - 1] !== last) picked.push(last);
  return picked;
}

/** Suggested X label angle when ticks are still dense after thinning. */
export function axisTickAngle(tickCount: number): number {
  return tickCount > 6 ? -30 : 0;
}

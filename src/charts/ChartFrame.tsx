import type { ReactElement, ReactNode } from 'react';
import { ActionIcon, Popover, Skeleton } from '@mantine/core';
import { ResponsiveContainer } from 'recharts';
import { Section, type SectionProps } from '../components/Section';
import { EmptyState, ErrorState } from '../components/States';
import { useChartTheme } from './theme';

export interface ChartFrameProps extends Omit<SectionProps, 'children' | 'title'> {
  title: ReactNode;
  /** «?» popover explaining how to read the chart. */
  explanation?: ReactNode;
  /** Desktop height (phones get a compact height). Default `CHART_HEIGHT`. */
  height?: number;
  loading?: boolean;
  /** Shows `ErrorState` instead of the chart. */
  error?: unknown;
  onRetry?: () => void;
  /** No data: shows an empty state of the same height. */
  empty?: boolean;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  /** Under the chart: a note, a data table toggle, a source. */
  footer?: ReactNode;
  /**
   * A single Recharts chart element (wrapped in `ResponsiveContainer`), or a render function receiving the
   * resolved height when you need it.
   */
  children: ReactElement | ((size: { height: number; isCompact: boolean }) => ReactNode);
}

/** Section for a chart: title + controls, responsive height, loading/empty/error states, «?» explanation. */
export function ChartFrame({
  title,
  explanation,
  actions,
  height,
  loading,
  error,
  onRetry,
  empty,
  emptyTitle = 'Нет данных',
  emptyDescription = 'За выбранный период данных нет.',
  footer,
  children,
  ...sectionProps
}: ChartFrameProps) {
  const theme = useChartTheme({ height });
  const h = theme.height;

  const heading = (
    <span className="mvv-chart-heading">
      {title}
      {explanation != null && (
        <Popover width={300} position="bottom-start" withArrow>
          <Popover.Target>
            <ActionIcon variant="subtle" color="gray" size="xs" radius="xl" aria-label="Как читать график">
              <span className="mvv-chart-help" aria-hidden="true">
                ?
              </span>
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <div className="mvv-chart-explanation">{explanation}</div>
          </Popover.Dropdown>
        </Popover>
      )}
    </span>
  );

  let body: ReactNode;
  if (loading) body = <Skeleton height={h} radius="sm" />;
  else if (error !== undefined && error !== null && error !== false)
    body = (
      <div className="mvv-chart-fill" style={{ minHeight: h }}>
        <ErrorState error={error} onRetry={onRetry} compact />
      </div>
    );
  else if (empty)
    body = (
      <div className="mvv-chart-fill" style={{ minHeight: h }}>
        <EmptyState title={emptyTitle} description={emptyDescription} compact />
      </div>
    );
  else if (typeof children === 'function') body = children({ height: h, isCompact: theme.isCompact });
  else
    body = (
      <div className="mvv-chart-canvas" style={{ height: h }}>
        <ResponsiveContainer width="100%" height={h}>
          {children}
        </ResponsiveContainer>
      </div>
    );

  return (
    <Section title={heading} actions={actions} {...sectionProps}>
      {body}
      {footer != null && <div className="mvv-chart-footer">{footer}</div>}
    </Section>
  );
}

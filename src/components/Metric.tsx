import type { HTMLAttributes, ReactNode } from 'react';
import { Skeleton } from '@mantine/core';
import { cx } from './cx';
import { IconArrowDownRight, IconArrowUpRight, IconMinus } from './icons';

export type MetricTone = 'positive' | 'negative' | 'neutral';

export interface MetricDelta {
  /** Already formatted (`+4,2%`, `−12 000 ₽`). */
  value: ReactNode;
  tone: MetricTone;
}

export interface MetricProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  label: ReactNode;
  /** Already formatted value. Rendered with tabular figures. */
  value: ReactNode;
  /** Muted line under the value (period, comparison base). */
  hint?: ReactNode;
  delta?: MetricDelta;
  icon?: ReactNode;
  loading?: boolean;
}

const TONE_ICON = { positive: IconArrowUpRight, negative: IconArrowDownRight, neutral: IconMinus } as const;
const TONE_LABEL = { positive: 'рост', negative: 'снижение', neutral: 'без изменений' } as const;

/** Key figure: label, big tabular value, optional delta chip and hint. */
export function Metric({ label, value, hint, delta, icon, loading, className, ...rest }: MetricProps) {
  const DeltaIcon = delta ? TONE_ICON[delta.tone] : null;
  return (
    <div className={cx('mvv-metric', className)} aria-busy={loading || undefined} {...rest}>
      <div className="mvv-metric-top">
        <span className="mvv-metric-label">{label}</span>
        {icon != null && (
          <span className="mvv-metric-icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      {loading ? (
        <div className="mvv-metric-loading">
          <Skeleton height={28} width="62%" radius="sm" />
          <Skeleton height={12} width="40%" radius="sm" mt={10} />
        </div>
      ) : (
        <>
          <div className="mvv-metric-value mvv-num">{value}</div>
          {(delta || hint != null) && (
            <div className="mvv-metric-foot">
              {delta && DeltaIcon && (
                <span className="mvv-metric-delta mvv-num" data-tone={delta.tone}>
                  <DeltaIcon size={13} stroke={2} />
                  <span className="mvv-visually-hidden">{TONE_LABEL[delta.tone]}: </span>
                  {delta.value}
                </span>
              )}
              {hint != null && <span className="mvv-metric-hint">{hint}</span>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export interface MetricGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Columns on wide screens (collapses to 2 on tablets and phones, 1 below 360px). Default 4. */
  cols?: 1 | 2 | 3 | 4;
  children?: ReactNode;
}

/** Responsive grid of `Metric`s. */
export function MetricGrid({ cols = 4, className, children, ...rest }: MetricGridProps) {
  return (
    <div className={cx('mvv-metric-grid', className)} data-cols={cols} {...rest}>
      {children}
    </div>
  );
}

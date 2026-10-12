import type { ReactNode } from 'react';

export interface ChartTooltipRow {
  label: ReactNode;
  value: ReactNode;
  /** Series colour (shown as a dot; text stays in text colours). */
  color?: string;
}

interface PayloadEntry {
  name?: unknown;
  value?: unknown;
  color?: string;
  stroke?: string;
  fill?: string;
  dataKey?: unknown;
  payload?: unknown;
}

export interface ChartTooltipProps {
  /** Manual mode: title + rows. */
  title?: ReactNode;
  rows?: ChartTooltipRow[];
  /** Recharts mode (`<Tooltip content={<ChartTooltip valueFormatter={…} />} />`) — injected by Recharts. */
  active?: boolean;
  payload?: readonly PayloadEntry[];
  label?: unknown;
  /** Formats each value (full precision, not compact). */
  valueFormatter?: (value: unknown, name: string, entry: PayloadEntry) => ReactNode;
  /** Formats the title (the X value). */
  labelFormatter?: (label: unknown) => ReactNode;
  /** Optional footer row, e.g. a total. */
  footer?: ChartTooltipRow;
  /** Plain muted text under the rows (a caveat, a source). */
  note?: ReactNode;
}

/**
 * The one tooltip card for every chart: title, rows with a colour dot, name in secondary ink and the value
 * right-aligned in tabular figures. Works as a Recharts `content` element or standalone with `title`/`rows`.
 */
export function ChartTooltip({
  title,
  rows,
  active,
  payload,
  label,
  valueFormatter,
  labelFormatter,
  footer,
  note,
}: ChartTooltipProps) {
  let resolvedRows = rows;
  let resolvedTitle = title;
  if (!resolvedRows) {
    if (active === false || !payload || payload.length === 0) return null;
    resolvedRows = payload
      .filter((entry) => entry.value !== null && entry.value !== undefined)
      .map((entry) => {
      const name = String(entry.name ?? entry.dataKey ?? '');
      return {
        label: name,
        value: valueFormatter ? valueFormatter(entry.value, name, entry) : String(entry.value ?? '—'),
        color: entry.color ?? entry.stroke ?? entry.fill,
      };
    });
    if (resolvedRows.length === 0) return null;
    if (resolvedTitle === undefined && label !== undefined && label !== null && label !== '') {
      resolvedTitle = labelFormatter ? labelFormatter(label) : String(label);
    }
  }
  if (resolvedRows.length === 0 && resolvedTitle == null) return null;

  return (
    <div className="mvv-chart-tooltip" role="status">
      {resolvedTitle != null && <div className="mvv-chart-tooltip-title">{resolvedTitle}</div>}
      {resolvedRows.map((row, i) => (
        <div className="mvv-chart-tooltip-row" key={i}>
          {row.color && <span className="mvv-chart-tooltip-dot" style={{ background: row.color }} aria-hidden="true" />}
          <span className="mvv-chart-tooltip-label">{row.label}</span>
          <span className="mvv-chart-tooltip-value mvv-num">{row.value}</span>
        </div>
      ))}
      {footer && (
        <div className="mvv-chart-tooltip-row mvv-chart-tooltip-footer">
          <span className="mvv-chart-tooltip-label">{footer.label}</span>
          <span className="mvv-chart-tooltip-value mvv-num">{footer.value}</span>
        </div>
      )}
      {note != null && <div className="mvv-chart-tooltip-note">{note}</div>}
    </div>
  );
}

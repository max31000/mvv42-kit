import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface PageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Page heading (rendered as the page's `<h1>`). */
  title?: ReactNode;
  /** One-line context under the title. */
  description?: ReactNode;
  /** Small label above the title (section name, breadcrumb). */
  eyebrow?: ReactNode;
  /** Page-level actions, right-aligned with the title (wrap under it on phones). */
  actions?: ReactNode;
  /** `default` 1080px (forms, reading), `wide` 1360px (dashboards, tables), `full` edge to edge. */
  width?: 'default' | 'wide' | 'full';
  /** Vertical gap between direct children. Default 24px. */
  gap?: number | string;
  children?: ReactNode;
}

/** Page container: max-width column, gutters and an optional title row. Children stack with a 24px gap. */
export function Page({ title, description, eyebrow, actions, width = 'default', gap, className, style, children, ...rest }: PageProps) {
  const hasHeader = title != null || description != null || actions != null || eyebrow != null;
  return (
    <div
      className={cx('mvv-page', className)}
      data-width={width}
      style={gap != null ? { ...style, ['--mvv-page-gap' as string]: typeof gap === 'number' ? `${gap}px` : gap } : style}
      {...rest}
    >
      {hasHeader && (
        <header className="mvv-page-header">
          <div className="mvv-page-heading">
            {eyebrow != null && <div className="mvv-page-eyebrow">{eyebrow}</div>}
            {title != null && <h1 className="mvv-page-title">{title}</h1>}
            {description != null && <p className="mvv-page-description">{description}</p>}
          </div>
          {actions != null && <div className="mvv-page-actions">{actions}</div>}
        </header>
      )}
      <div className="mvv-page-body">{children}</div>
    </div>
  );
}

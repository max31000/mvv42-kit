import { useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from './cx';

export type SectionPadding = 'none' | 'sm' | 'md' | 'lg';

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  /** Right side of the header: filters, a SegmentedControl, buttons. */
  actions?: ReactNode;
  /**
   * Body padding: `none` lets a Table or list run edge to edge (the header keeps its padding), `sm` 12px,
   * `md` 20px (default), `lg` 24px.
   */
  padding?: SectionPadding;
  /** `card` (surface with hairline border, default) or `plain` (heading only, sits on the page). */
  variant?: 'card' | 'plain';
  children?: ReactNode;
}

/** A titled block of a page: surface card with an optional header row. */
export function Section({
  title,
  description,
  actions,
  padding = 'md',
  variant = 'card',
  className,
  children,
  ...rest
}: SectionProps) {
  const id = useId();
  const hasHeader = title != null || description != null || actions != null;
  return (
    <section
      className={cx('mvv-section', className)}
      data-variant={variant}
      data-padding={padding}
      aria-labelledby={title != null ? id : undefined}
      {...rest}
    >
      {hasHeader && (
        <div className="mvv-section-header">
          <div className="mvv-section-heading">
            {title != null && (
              <h2 id={id} className="mvv-section-title">
                {title}
              </h2>
            )}
            {description != null && <p className="mvv-section-description">{description}</p>}
          </div>
          {actions != null && <div className="mvv-section-actions">{actions}</div>}
        </div>
      )}
      {children != null && <div className="mvv-section-body">{children}</div>}
    </section>
  );
}

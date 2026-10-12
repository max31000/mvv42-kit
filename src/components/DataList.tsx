import type { AnchorHTMLAttributes, HTMLAttributes, MouseEventHandler, ReactNode } from 'react';
import { cx } from './cx';

export interface DataListProps extends HTMLAttributes<HTMLUListElement> {
  children?: ReactNode;
}

/** Divided list of `ListRow`s; put it in `<Section padding="none">` so rows run edge to edge. */
export function DataList({ className, children, ...rest }: DataListProps) {
  return (
    <ul className={cx('mvv-data-list', className)} {...rest}>
      {children}
    </ul>
  );
}

export interface ListRowProps extends Omit<HTMLAttributes<HTMLLIElement>, 'title' | 'onClick'> {
  title: ReactNode;
  description?: ReactNode;
  /** Leading glyph (icon, avatar, AppIcon). */
  icon?: ReactNode;
  /** Trailing value (amount, status badge). Tabular figures. */
  value?: ReactNode;
  /** Trailing control (button, menu) — rendered outside the clickable area. */
  action?: ReactNode;
  /** Makes the row a link. */
  href?: string;
  /** Extra props for the link (target, rel, router `onClick`). */
  linkProps?: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className'>;
  /** Makes the row a button. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Muted, non-interactive look. */
  disabled?: boolean;
}

/**
 * One row of a `DataList`: icon · title + description · value · action. With `href` or `onClick` the main
 * area is a real link/button (hover surface, `:focus-visible` ring, Enter/Space); `action` stays a sibling so
 * controls are never nested inside it.
 */
export function ListRow({
  title,
  description,
  icon,
  value,
  action,
  href,
  linkProps,
  onClick,
  disabled,
  className,
  ...rest
}: ListRowProps) {
  const content = (
    <>
      {icon != null && (
        <span className="mvv-list-row-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="mvv-list-row-text">
        <span className="mvv-list-row-title">{title}</span>
        {description != null && <span className="mvv-list-row-description">{description}</span>}
      </span>
      {value != null && <span className="mvv-list-row-value mvv-num">{value}</span>}
    </>
  );
  let main: ReactNode;
  if (href && !disabled) {
    main = (
      <a className="mvv-list-row-main" data-interactive href={href} {...linkProps}>
        {content}
      </a>
    );
  } else if (onClick && !disabled) {
    main = (
      <button type="button" className="mvv-list-row-main" data-interactive onClick={onClick}>
        {content}
      </button>
    );
  } else {
    main = <div className="mvv-list-row-main">{content}</div>;
  }
  return (
    <li className={cx('mvv-list-row', className)} data-disabled={disabled || undefined} {...rest}>
      {main}
      {action != null && <div className="mvv-list-row-action">{action}</div>}
    </li>
  );
}

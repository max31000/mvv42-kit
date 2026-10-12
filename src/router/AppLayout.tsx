import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useMvv42Context } from '../context';
import { AccountButton, ColorSchemeToggle } from '../components/Account';
import { cx } from '../components/cx';
import { useShellRouterSync } from './useShellRouterSync';

export interface NavItem {
  label: ReactNode;
  /** Router path (relative to the router's basename). */
  to: string;
  icon?: ReactNode;
  /** Small counter or text pill after the label (e.g. unread signals). */
  badge?: ReactNode;
  /** Match only the exact path. Defaults to `true` for `/`. */
  end?: boolean;
}

export interface AppLayoutProps {
  /** Service name (top bar in standalone mode; nav landmark label). */
  title: string;
  /** Service glyph — shown in an accent-coloured tile in standalone mode. */
  icon?: ReactNode;
  nav: NavItem[];
  /** Right side of the bar: sync status, «Обновить», etc. */
  actions?: ReactNode;
  /** Where the mvv42 mark links in standalone mode. Default `/` (the shell). */
  homeHref?: string;
  children?: ReactNode;
}

function scrollIntoViewIfPossible(el: Element | null) {
  if (el && typeof (el as HTMLElement).scrollIntoView === 'function') {
    (el as HTMLElement).scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}

function Tabs({ title, nav }: Pick<AppLayoutProps, 'title' | 'nav'>) {
  const listRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Keep the active tab visible in the horizontally scrolling strip (phones, long navs).
  useEffect(() => {
    scrollIntoViewIfPossible(listRef.current?.querySelector('[aria-current="page"]') ?? null);
  }, [location.pathname]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const links = Array.from(listRef.current?.querySelectorAll<HTMLAnchorElement>('a.mvv-nav-tab') ?? []);
    const index = links.findIndex((a) => a === document.activeElement);
    if (index === -1) return;
    e.preventDefault();
    const nextIndex =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? links.length - 1
          : (index + (e.key === 'ArrowRight' ? 1 : -1) + links.length) % links.length;
    links[nextIndex]?.focus();
    scrollIntoViewIfPossible(links[nextIndex] ?? null);
  };

  if (nav.length === 0) return null;
  return (
    <nav className="mvv-nav" aria-label={`Разделы: ${title}`}>
      <div className="mvv-nav-list" ref={listRef} onKeyDown={onKeyDown}>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end ?? item.to === '/'}
            className={({ isActive }) => cx('mvv-nav-tab', isActive && 'mvv-nav-tab-active')}
          >
            {item.icon != null && (
              <span className="mvv-nav-tab-icon" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span className="mvv-nav-tab-label">{item.label}</span>
            {item.badge != null && item.badge !== false && <span className="mvv-nav-tab-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

/**
 * Service chrome. Inside the shell: a compact 44px sticky bar with the section tabs and `actions` (the shell
 * already shows brand, theme and account). Standalone: a 52px top bar (mvv42 mark → `/`, service name,
 * actions, theme toggle, account) above the same tab strip. Tabs are react-router `NavLink`s (`aria-current`),
 * scroll horizontally on phones, and support ←/→/Home/End. Also keeps the shell's address bar in sync.
 */
export function AppLayout({ title, icon, nav, actions, homeHref = '/', children }: AppLayoutProps) {
  const { serviceId, insideShell } = useMvv42Context();
  useShellRouterSync(serviceId);

  return (
    <div className="mvv-app" data-embedded={insideShell || undefined}>
      <a className="mvv-skip-link" href="#mvv-main">
        К содержимому
      </a>
      <header className="mvv-app-header">
        {!insideShell && (
          <div className="mvv-topbar">
            <div className="mvv-topbar-left">
              <a href={homeHref} className="mvv-brand" aria-label="mvv42 — все сервисы">
                <span className="mvv-brand-mark" aria-hidden="true">
                  m
                </span>
                <span className="mvv-brand-wordmark">mvv42</span>
              </a>
              <span className="mvv-topbar-slash" aria-hidden="true">
                /
              </span>
              <div className="mvv-topbar-service">
                {icon != null && (
                  <span className="mvv-service-tile" aria-hidden="true">
                    {icon}
                  </span>
                )}
                <span className="mvv-topbar-title">{title}</span>
              </div>
            </div>
            <div className="mvv-topbar-right">
              {actions != null && <div className="mvv-topbar-actions">{actions}</div>}
              <ColorSchemeToggle />
              <div className="mvv-topbar-account">
                <AccountButton />
              </div>
            </div>
          </div>
        )}
        {(nav.length > 0 || (insideShell && actions != null)) && (
          <div className="mvv-subnav">
            <Tabs title={title} nav={nav} />
            {insideShell && actions != null && <div className="mvv-subnav-actions">{actions}</div>}
          </div>
        )}
      </header>
      <main id="mvv-main" className="mvv-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

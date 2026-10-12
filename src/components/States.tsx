import type { HTMLAttributes, ReactNode } from 'react';
import { Button } from '@mantine/core';
import { cx } from './cx';
import { IconAlertTriangle, IconBan, IconInbox, IconRefresh } from './icons';
import { ApiError } from '../platform/types';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Primary next step (a Button). */
  action?: ReactNode;
  /** Less vertical padding — for empty tables and small sections. */
  compact?: boolean;
}

/** «Nothing here yet»: icon tile, title, one sentence and the next step. */
export function EmptyState({ icon, title, description, action, compact, className, ...rest }: EmptyStateProps) {
  return (
    <div className={cx('mvv-state', className)} data-compact={compact || undefined} {...rest}>
      <div className="mvv-state-icon" aria-hidden="true">
        {icon ?? <IconInbox size={22} />}
      </div>
      <div className="mvv-state-title">{title}</div>
      {description != null && <p className="mvv-state-description">{description}</p>}
      {action != null && <div className="mvv-state-action">{action}</div>}
    </div>
  );
}

export interface ErrorStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Defaults by status: 403 «Нет доступа», 404 «Не найдено», otherwise «Не удалось загрузить данные». */
  title?: ReactNode;
  /** An `ApiError`, `Error`, string or anything thrown. */
  error?: unknown;
  /** Shows «Повторить». */
  onRetry?: () => void;
  /** Shows the retry button as busy (e.g. while re-fetching). */
  retrying?: boolean;
  compact?: boolean;
}

function describe(error: unknown): { status: number | null; message: string | null; detail: string | null } {
  if (error instanceof ApiError) {
    const detail = [`HTTP ${error.status}`, error.code].filter(Boolean).join(' · ');
    return { status: error.status, message: null, detail };
  }
  if (error instanceof Error) return { status: null, message: error.message || null, detail: null };
  if (typeof error === 'string') return { status: null, message: error, detail: null };
  return { status: null, message: null, detail: null };
}

const STATUS_TEXT: Record<number, { title: string; description: string }> = {
  401: { title: 'Нужно войти', description: 'Сессия истекла — войдите снова.' },
  403: { title: 'Нет доступа', description: 'У вашего аккаунта нет доступа к этому разделу.' },
  404: { title: 'Не найдено', description: 'Запрошенные данные не существуют или были удалены.' },
};

/** Failed load: what happened, a technical hint and «Повторить». Knows 401/403/404 from `ApiError`. */
export function ErrorState({ title, error, onRetry, retrying, compact, className, ...rest }: ErrorStateProps) {
  const { status, message, detail } = describe(error);
  const known = status != null ? STATUS_TEXT[status] : undefined;
  const denied = status === 403 || status === 401;
  return (
    <div className={cx('mvv-state', className)} data-tone="danger" data-compact={compact || undefined} role="alert" {...rest}>
      <div className="mvv-state-icon" aria-hidden="true">
        {denied ? <IconBan size={22} /> : <IconAlertTriangle size={22} />}
      </div>
      <div className="mvv-state-title">{title ?? known?.title ?? 'Не удалось загрузить данные'}</div>
      <p className="mvv-state-description">
        {message ?? known?.description ?? 'Проверьте соединение и попробуйте ещё раз.'}
      </p>
      {detail && <code className="mvv-state-detail">{detail}</code>}
      {onRetry && (
        <div className="mvv-state-action">
          <Button variant="default" leftSection={<IconRefresh size={16} />} onClick={onRetry} loading={retrying}>
            Повторить
          </Button>
        </div>
      )}
    </div>
  );
}

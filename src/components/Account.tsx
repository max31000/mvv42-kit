import { useEffect, useState, type ReactNode } from 'react';
import { Button, Loader, Menu, Skeleton, UnstyledButton, useMantineColorScheme } from '@mantine/core';
import { useInsideShell, useMvv42Context } from '../context';
import { logout, requestLogin } from '../platform/client';
import { useMe } from '../platform/useMe';
import type { Mvv42User } from '../platform/types';
import { cx } from './cx';
import { IconBan, IconBrandTelegram, IconDeviceDesktop, IconLock, IconLogout, IconMoon, IconSun } from './icons';
import { ErrorState } from './States';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return letters.map((p) => [...p][0]?.toUpperCase() ?? '').join('') || '?';
}

export interface UserAvatarProps {
  user: Pick<Mvv42User, 'name' | 'photoUrl'>;
  size?: number;
  className?: string;
}

/** Telegram photo or initials, round, with a hairline ring. */
export function UserAvatar({ user, size = 28, className }: UserAvatarProps) {
  const [broken, setBroken] = useState(false);
  if (user.photoUrl && !broken) {
    return (
      <img
        className={cx('mvv-user-avatar', className)}
        src={user.photoUrl}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <span
      className={cx('mvv-user-avatar', className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden="true"
    >
      {initials(user.name)}
    </span>
  );
}

const SCHEME_LABEL = { auto: 'Тема: как в системе', light: 'Тема: светлая', dark: 'Тема: тёмная' } as const;

/** Icon button cycling auto → light → dark. Hidden inside the shell (the shell owns the setting). */
export function ColorSchemeToggle({ className }: { className?: string }) {
  const insideShell = useInsideShell();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  if (insideShell) return null;
  const next = colorScheme === 'auto' ? 'light' : colorScheme === 'light' ? 'dark' : 'auto';
  const Icon = colorScheme === 'dark' ? IconMoon : colorScheme === 'light' ? IconSun : IconDeviceDesktop;
  const label = SCHEME_LABEL[colorScheme];
  return (
    <UnstyledButton
      className={cx('mvv-icon-button', className)}
      onClick={() => setColorScheme(next)}
      title={label}
      aria-label={`${label}. Переключить`}
    >
      <Icon size={18} />
    </UnstyledButton>
  );
}

/**
 * Standalone account control: «Войти» (→ shell login) or the avatar menu with name and «Выйти».
 * Renders nothing inside the shell (the shell shows the account) or when auth is unavailable.
 */
export function AccountButton() {
  const { serviceId, insideShell } = useMvv42Context();
  const { user, loading, status } = useMe();
  if (insideShell || status === 'unavailable') return null;
  if (loading) return <Skeleton circle height={28} aria-label="Загрузка аккаунта" />;
  if (!user) {
    return (
      <Button variant="default" size="xs" onClick={() => requestLogin(serviceId)}>
        Войти
      </Button>
    );
  }
  return (
    <Menu position="bottom-end" offset={8} width={240}>
      <Menu.Target>
        <UnstyledButton className="mvv-icon-button mvv-account-trigger" aria-label={`Аккаунт: ${user.name}`}>
          <UserAvatar user={user} size={28} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <div className="mvv-account-header">
          <UserAvatar user={user} size={36} />
          <div className="mvv-account-who">
            <div className="mvv-account-name">{user.name}</div>
            {user.username && <div className="mvv-account-handle">@{user.username}</div>}
          </div>
        </div>
        <Menu.Divider />
        <Menu.Item leftSection={<IconLogout size={16} />} onClick={() => void logout()}>
          Выйти
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export interface LoginRequiredProps {
  /** Default «Войдите, чтобы продолжить». */
  title?: ReactNode;
  /** Default: «Этот раздел доступен после входа через Telegram.» */
  description?: ReactNode;
  /** Protected content, rendered once the user is signed in and has access to the service. */
  children?: ReactNode;
}

/**
 * Gate for screens that need a signed-in user. Uses the service id from `Mvv42Provider`.
 * Loading → spinner; auth unavailable → error with retry; anonymous → «Войти через Telegram»;
 * signed in without a grant for this service → «Нет доступа»; otherwise `children`.
 */
export function LoginRequired({ title, description, children }: LoginRequiredProps) {
  const { serviceId } = useMvv42Context();
  const { user, loading, status, app, refresh } = useMe();
  const [retrying, setRetrying] = useState(false);
  const access = user ? app(serviceId) : undefined;
  const missing = Boolean(user) && !access;

  useEffect(() => {
    if (missing) {
      console.warn(
        `[@mvv42/kit] LoginRequired: service "${serviceId}" is not listed in /auth/api/me — treating it as not granted. ` +
          'Check the serviceId passed to Mvv42Provider and the auth registry.',
      );
    }
  }, [missing, serviceId]);

  const retry = () => {
    setRetrying(true);
    void refresh().finally(() => setRetrying(false));
  };

  if (loading) {
    return (
      <div className="mvv-gate" aria-busy="true">
        <Loader size="sm" aria-label="Загрузка" />
      </div>
    );
  }
  if (status === 'unavailable') {
    return (
      <div className="mvv-gate">
        <ErrorState
          className="mvv-gate-card"
          title="Сервис входа недоступен"
          error="Не получилось проверить вход. Попробуйте ещё раз через минуту."
          onRetry={retry}
          retrying={retrying}
        />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="mvv-gate">
        <div className="mvv-gate-card mvv-state">
          <div className="mvv-state-icon" aria-hidden="true">
            <IconLock size={22} />
          </div>
          <div className="mvv-state-title">{title ?? 'Войдите, чтобы продолжить'}</div>
          <p className="mvv-state-description">{description ?? 'Этот раздел доступен после входа через Telegram.'}</p>
          <div className="mvv-state-action">
            <Button leftSection={<IconBrandTelegram size={16} />} onClick={() => requestLogin(serviceId)}>
              Войти через Telegram
            </Button>
          </div>
        </div>
      </div>
    );
  }
  if (!access || !access.granted) {
    return (
      <div className="mvv-gate">
        <div className="mvv-gate-card mvv-state">
          <div className="mvv-state-icon" aria-hidden="true">
            <IconBan size={22} />
          </div>
          <div className="mvv-state-title">Нет доступа</div>
          <p className="mvv-state-description">
            Аккаунт {user.name} пока не имеет доступа к этому сервису. Попросите владельца выдать доступ или
            прислать приглашение.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

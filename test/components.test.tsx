import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Button, Select, Table, TextInput } from '@mantine/core';
import type { ReactNode } from 'react';
import {
  AccountButton,
  EmptyState,
  ErrorState,
  LoginRequired,
  Metric,
  MetricGrid,
  Mvv42Provider,
  Page,
  Section,
  useMvv42Context,
} from '../src';
import { AppLayout, type NavItem } from '../src/router';
import { ApiError } from '../src/platform';
import { __resetMeForTests } from '../src/platform/useMe';
import { embedInShell, jsonResponse, postFrom } from './helpers';

const fetchMock = vi.fn<typeof fetch>();
const USER = { id: 1, telegramId: 2, name: 'Максим Водопьянов', username: 'mvv', photoUrl: null, isAdmin: false, isOwner: false };

function meResponse(me: unknown) {
  fetchMock.mockImplementation((input) =>
    Promise.resolve(String(input).endsWith('/auth/api/me') ? jsonResponse(200, me) : new Response(null, { status: 204 })),
  );
}

function wrap(ui: ReactNode, props: { insideShell?: boolean; accent?: 'violet' } = {}) {
  return render(
    <Mvv42Provider serviceId="bonds" env="test" {...props}>
      {ui}
    </Mvv42Provider>,
  );
}

beforeEach(() => {
  __resetMeForTests();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Mvv42Provider', () => {
  it('exposes service id, accent and shell mode', () => {
    function Probe() {
      const ctx = useMvv42Context();
      return <span>{`${ctx.serviceId}:${ctx.accent}:${ctx.insideShell}`}</span>;
    }
    wrap(<Probe />, { accent: 'violet' });
    expect(screen.getByText('bonds:violet:false')).toBeInTheDocument();
  });

  it('removes legacy auth keys and migrates the legacy colour scheme on startup', () => {
    localStorage.setItem('bonds-auth', '{"token":"x"}');
    localStorage.setItem('mantine-color-scheme-value', 'dark');
    wrap(<div />);
    expect(localStorage.getItem('bonds-auth')).toBeNull();
    expect(localStorage.getItem('mvv42-color-scheme')).toBe('dark');
  });

  it('applies the theme class names to Mantine components', () => {
    wrap(
      <>
        <Button>Go</Button>
        <TextInput label="Имя" />
        <Select label="Счёт" data={['a']} />
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>H</Table.Th>
            </Table.Tr>
          </Table.Thead>
        </Table>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Go' })).toHaveClass('mvv-button');
    expect(screen.getByLabelText('Имя')).toHaveClass('mvv-input-field');
    expect(screen.getByRole('combobox', { name: 'Счёт' })).toHaveClass('mvv-input-field');
    expect(screen.getByText('Имя')).toHaveClass('mvv-input-label');
    expect(screen.getByText('H')).toHaveClass('mvv-table-th');
  });

  it('inside the shell: announces READY and applies THEME without persisting it', async () => {
    const { parent, restore } = embedInShell();
    localStorage.setItem('mvv42-color-scheme', 'light');
    meResponse({ user: null, apps: [] });
    wrap(<div />, { insideShell: true });
    await waitFor(() =>
      expect(parent.postMessage).toHaveBeenCalledWith({ type: 'READY', serviceId: 'bonds' }, window.location.origin),
    );
    act(() => postFrom(parent, { type: 'THEME', scheme: 'dark' }));
    await waitFor(() => expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe('dark'));
    expect(localStorage.getItem('mvv42-color-scheme')).toBe('light');
    restore();
  });
});

describe('layout primitives', () => {
  it('Page renders an h1, description and actions', () => {
    wrap(
      <Page title="Позиции" description="36 выпусков" actions={<button>Экспорт</button>} width="wide">
        body
      </Page>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Позиции' })).toBeInTheDocument();
    expect(screen.getByText('36 выпусков')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Экспорт' })).toBeInTheDocument();
    expect(screen.getByText('body').closest('.mvv-page')).toHaveAttribute('data-width', 'wide');
  });

  it('Section is a labelled region', () => {
    wrap(
      <Section title="Денежный поток" padding="none">
        x
      </Section>,
    );
    expect(screen.getByRole('region', { name: 'Денежный поток' })).toHaveAttribute('data-padding', 'none');
  });

  it('Metric shows value, delta with an accessible tone, and a loading state', () => {
    wrap(
      <MetricGrid cols={3}>
        <Metric label="Стоимость" value="1 284 560 ₽" delta={{ value: '+3,2%', tone: 'positive' }} hint="за 30 дней" />
        <Metric label="Купоны" value="—" loading />
      </MetricGrid>,
    );
    expect(screen.getByText('1 284 560 ₽')).toBeInTheDocument();
    expect(screen.getByText(/рост/)).toBeInTheDocument();
    expect(screen.getByText('Купоны').closest('.mvv-metric')).toHaveAttribute('aria-busy', 'true');
  });

  it('EmptyState and ErrorState', async () => {
    const onRetry = vi.fn();
    wrap(
      <>
        <EmptyState title="Пусто" description="Добавьте операцию" action={<button>Добавить</button>} />
        <ErrorState error={new ApiError(403, 'forbidden')} />
        <ErrorState error={new ApiError(500, null)} onRetry={onRetry} />
      </>,
    );
    expect(screen.getByText('Пусто')).toBeInTheDocument();
    expect(screen.getByText('Нет доступа')).toBeInTheDocument();
    expect(screen.getByText('HTTP 403 · forbidden')).toBeInTheDocument();
    expect(screen.getByText('Не удалось загрузить данные')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('LoginRequired', () => {
  it('asks an anonymous visitor to sign in', async () => {
    meResponse({ user: null, apps: [{ id: 'bonds', anonymous: false, access: 'admin', granted: false }] });
    wrap(
      <LoginRequired>
        <p>secret</p>
      </LoginRequired>,
    );
    expect(await screen.findByRole('button', { name: 'Войти через Telegram' })).toBeInTheDocument();
    expect(screen.queryByText('secret')).toBeNull();
  });

  it('shows «Нет доступа» to a signed-in user without a grant for the provider service', async () => {
    meResponse({ user: USER, apps: [{ id: 'bonds', anonymous: false, access: 'admin', granted: false }] });
    wrap(
      <LoginRequired>
        <p>secret</p>
      </LoginRequired>,
    );
    expect(await screen.findByText('Нет доступа')).toBeInTheDocument();
  });

  it('renders children for a granted user', async () => {
    meResponse({ user: USER, apps: [{ id: 'bonds', anonymous: false, access: 'admin', granted: true }] });
    wrap(
      <LoginRequired>
        <p>secret</p>
      </LoginRequired>,
    );
    expect(await screen.findByText('secret')).toBeInTheDocument();
  });

  it('offers a retry when auth is unavailable', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 502 }));
    wrap(
      <LoginRequired>
        <p>secret</p>
      </LoginRequired>,
    );
    expect(await screen.findByText('Сервис входа недоступен')).toBeInTheDocument();
  });
});

describe('AccountButton', () => {
  it('shows «Войти» for an anonymous visitor and an avatar menu for a user', async () => {
    meResponse({ user: null, apps: [] });
    const { unmount } = wrap(<AccountButton />);
    expect(await screen.findByRole('button', { name: 'Войти' })).toBeInTheDocument();
    unmount();

    __resetMeForTests();
    meResponse({ user: USER, apps: [] });
    wrap(<AccountButton />);
    const trigger = await screen.findByRole('button', { name: `Аккаунт: ${USER.name}` });
    expect(trigger).toHaveTextContent('МВ');
  });

  it('renders nothing inside the shell', async () => {
    meResponse({ user: USER, apps: [] });
    const { container } = wrap(<AccountButton />, { insideShell: true });
    await new Promise((r) => setTimeout(r, 10));
    expect(container.querySelector('button')).toBeNull();
  });
});

describe('AppLayout', () => {
  const nav: NavItem[] = [
    { label: 'Обзор', to: '/' },
    { label: 'Позиции', to: '/positions', badge: 3 },
    { label: 'Сигналы', to: '/signals' },
  ];

  function renderLayout(path: string, insideShell = false) {
    meResponse({ user: null, apps: [] });
    return render(
      <Mvv42Provider serviceId="bonds" env="test" insideShell={insideShell}>
        <MemoryRouter initialEntries={[path]}>
          <AppLayout title="Bond Analytics" nav={nav} actions={<button>Обновить</button>}>
            <Routes>
              <Route path="*" element={<p>content</p>} />
            </Routes>
          </AppLayout>
        </MemoryRouter>
      </Mvv42Provider>,
    );
  }

  it('marks exactly the active tab with aria-current="page" (root uses end)', () => {
    renderLayout('/positions');
    const navEl = screen.getByRole('navigation', { name: 'Разделы: Bond Analytics' });
    const current = navEl.querySelectorAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent('Позиции');
    expect(screen.getByRole('link', { name: 'Обзор' })).not.toHaveAttribute('aria-current');
  });

  it('has a main landmark, a skip link and focusable tabs with arrow-key navigation', async () => {
    renderLayout('/');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'mvv-main');
    expect(screen.getByRole('link', { name: 'К содержимому' })).toHaveAttribute('href', '#mvv-main');

    const user = userEvent.setup();
    const first = screen.getByRole('link', { name: 'Обзор' });
    first.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('link', { name: /Позиции/ })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('link', { name: 'Сигналы' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(first).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('link', { name: 'Сигналы' })).toHaveFocus();
  });

  it('standalone: brand link, service title, theme toggle', () => {
    renderLayout('/');
    expect(screen.getByRole('link', { name: 'mvv42 — все сервисы' })).toHaveAttribute('href', '/');
    expect(screen.getByText('Bond Analytics')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Тема/ })).toBeInTheDocument();
  });

  it('inside the shell: no top bar, tabs + actions only, NAVIGATE posted', async () => {
    const { parent, restore } = embedInShell();
    renderLayout('/signals?x=1', true);
    expect(screen.queryByRole('link', { name: 'mvv42 — все сервисы' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Тема/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Обновить' })).toBeInTheDocument();
    await waitFor(() =>
      expect(parent.postMessage).toHaveBeenCalledWith(
        { type: 'NAVIGATE', serviceId: 'bonds', path: '/signals?x=1' },
        window.location.origin,
      ),
    );
    restore();
  });
});

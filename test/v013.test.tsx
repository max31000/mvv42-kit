import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Button } from '@mantine/core';
import { LineChart } from 'recharts';
import { ErrorState, HelpHint } from '../src';
import { AppLayout } from '../src/router';
import { ChartFrame } from '../src/charts';
import { ApiError } from '../src/platform';
import { renderWithKit } from '../src/testing';

function phone(matches: boolean) {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: matches && query.includes('max-width'),
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

function layout(insideShell: boolean) {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(null, { status: 503 }))));
  return renderWithKit(
    <AppLayout title="Bonds" nav={[{ label: 'Обзор', to: '/' }]} actions={<Button>Обновить</Button>}>
      x
    </AppLayout>,
    { insideShell, wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> },
  );
}

describe('AppLayout actions on phones', () => {
  it.each([false, true])('insideShell=%s: desktop shows actions inline', (insideShell) => {
    const restore = phone(false);
    layout(insideShell);
    expect(screen.getByRole('button', { name: 'Обновить' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Действия' })).toBeNull();
    restore();
  });

  it.each([false, true])('insideShell=%s: phones collapse actions into an overflow menu', async (insideShell) => {
    const restore = phone(true);
    layout(insideShell);
    expect(screen.queryByRole('button', { name: 'Обновить' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Действия' }));
    expect(await screen.findByRole('button', { name: 'Обновить' })).toBeInTheDocument();
    restore();
  });
});

describe('ChartFrame', () => {
  it('renders an emptyAction and a test id on the help button', () => {
    renderWithKit(
      <ChartFrame title="Поток" empty emptyAction={<Button>Добавить</Button>} explanation="Как читать" data-testid="cashflow">
        <LineChart data={[]} />
      </ChartFrame>,
    );
    expect(screen.getByRole('button', { name: 'Добавить' })).toBeInTheDocument();
    expect(screen.getByTestId('cashflow-help')).toBeInTheDocument();
  });
});

describe('HelpHint', () => {
  it('opens its explanation', async () => {
    renderWithKit(<HelpHint label="Что такое YTM" data-testid="ytm-help">Доходность к погашению.</HelpHint>);
    await userEvent.click(screen.getByRole('button', { name: 'Что такое YTM' }));
    expect(await screen.findByText('Доходность к погашению.')).toBeInTheDocument();
    expect(screen.getByTestId('ytm-help')).toBeInTheDocument();
  });
});

describe('ErrorState description', () => {
  it('uses description and keeps the technical detail', () => {
    renderWithKit(<ErrorState error={new ApiError(500, 'boom')} description="Повторите через минуту." />);
    expect(screen.getByText('Повторите через минуту.')).toBeInTheDocument();
    expect(screen.getByText('HTTP 500 · boom')).toBeInTheDocument();
  });
});

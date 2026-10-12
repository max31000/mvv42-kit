import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from '@mantine/core';
import { DataList, ListRow, UserAvatar, safeAvatarUrl } from '../src';
import { ChartTooltip } from '../src/charts';
import { renderWithKit } from '../src/testing';

describe('safeAvatarUrl', () => {
  it.each([
    ['https://t.me/i/userpic/320/abc.jpg', true],
    ['https://cdn4.telegram-cdn.org/file/abc.jpg', true],
    ['https://telegram-cdn.org/file/abc.jpg', false],
    ['https://web.telegram.org/a.png', true],
    ['http://t.me/i/userpic/320/abc.jpg', false],
    ['https://evil.example/t.me.png', false],
    ['https://t.me.evil.example/x.png', false],
    ['javascript:alert(1)', false],
    ['data:image/png;base64,AAAA', false],
    ['not a url', false],
  ])('%s → %s', (url, ok) => {
    expect(safeAvatarUrl(url)).toBe(ok ? url : null);
  });

  it('handles null/undefined', () => {
    expect(safeAvatarUrl(null)).toBeNull();
    expect(safeAvatarUrl(undefined)).toBeNull();
  });

  it('UserAvatar falls back to initials for an untrusted photo', () => {
    const { container } = renderWithKit(<UserAvatar user={{ name: 'Иван Петров', photoUrl: 'https://evil.example/x.png' }} />);
    expect(container.querySelector('img')).toBeNull();
    expect(container).toHaveTextContent('ИП');
  });

  it('UserAvatar shows a trusted Telegram photo', () => {
    const { container } = renderWithKit(<UserAvatar user={{ name: 'И', photoUrl: 'https://t.me/i/userpic/320/a.jpg' }} />);
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://t.me/i/userpic/320/a.jpg');
  });
});

describe('ChartTooltip', () => {
  it('skips null/undefined payload values and renders a note', () => {
    renderWithKit(
      <ChartTooltip
        active
        label="янв"
        payload={[
          { name: 'Купоны', value: 100, color: 'red' },
          { name: 'Погашения', value: null },
          { name: 'Амортизация', value: undefined },
        ]}
        note="Без учёта налога"
      />,
    );
    expect(screen.getByText('Купоны')).toBeInTheDocument();
    expect(screen.queryByText('Погашения')).toBeNull();
    expect(screen.queryByText('Амортизация')).toBeNull();
    expect(screen.getByText('Без учёта налога')).toBeInTheDocument();
  });

  it('renders nothing when every value is empty and there is no label', () => {
    const { container } = renderWithKit(<ChartTooltip active payload={[{ name: 'x', value: null }]} />);
    expect(container.querySelector('.mvv-chart-tooltip')).toBeNull();
  });
});

describe('DataList / ListRow', () => {
  it('renders a list of rows with title, description, value and action', async () => {
    const onClick = vi.fn();
    renderWithKit(
      <DataList aria-label="Счета">
        <ListRow title="Т-Банк" description="Брокерский" value="1 200 ₽" onClick={onClick} />
        <ListRow title="Сбер" href="#/sber" value="300 ₽" action={<button>Ещё</button>} />
        <ListRow title="Наличные" value="50 ₽" />
      </DataList>,
    );
    const list = screen.getByRole('list', { name: 'Счета' });
    expect(list.querySelectorAll('li')).toHaveLength(3);
    const first = screen.getByRole('button', { name: /Т-Банк/ });
    first.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: /Сбер/ })).toHaveAttribute('href', '#/sber');
    expect(screen.getByRole('button', { name: 'Ещё' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Наличные/ })).toBeNull();
  });
});

describe('Slider marks', () => {
  it('get kit classes so labels do not widen the track', () => {
    const { container } = renderWithKit(
      <Slider defaultValue={10} marks={[{ value: 0, label: '0 ₽' }, { value: 100, label: '10 000 000 ₽' }]} />,
    );
    expect(container.querySelectorAll('.mvv-slider-mark-wrapper')).toHaveLength(2);
    expect(container.querySelectorAll('.mvv-slider-mark-label')).toHaveLength(2);
  });
});

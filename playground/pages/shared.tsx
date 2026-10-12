import { Button, Group, Text } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

export function HeaderActions() {
  return (
    <Group gap={10} wrap="nowrap">
      <Group gap={6} wrap="nowrap" visibleFrom="sm">
        <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--mvv-success)' }} aria-hidden="true" />
        <Text size="xs" c="dimmed">
          синк 4 мин назад
        </Text>
      </Group>
      <Button size="xs" variant="default" leftSection={<IconRefresh size={14} stroke={1.75} />}>
        Обновить
      </Button>
    </Group>
  );
}

export const rub = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
export const num = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
export const pct = (v: number, digits = 1) =>
  `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
export const compactRub = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} млн` : `${Math.round(v / 1000)} тыс`;

export const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export interface Bond {
  ticker: string;
  name: string;
  rating: string;
  sector: string;
  ytm: number;
  duration: number;
  price: number;
  qty: number;
  value: number;
  change: number;
  status: 'ok' | 'watch' | 'risk';
}

const NAMES = [
  ['RU000A105GN7', 'Сегежа 2Р-02', 'BBB', 'Лесная промышленность'],
  ['RU000A106ZL5', 'Самолёт П12', 'A-', 'Девелопмент'],
  ['SU26238RMFS4', 'ОФЗ 26238', 'AAA', 'Госдолг'],
  ['RU000A107HG1', 'ГТЛК 2Р-04', 'AA-', 'Лизинг'],
  ['RU000A105RH2', 'Новотрубзавод 1Р-02', 'A+', 'Металлургия'],
  ['RU000A1066J2', 'ЕвроТранс БО-001Р-03', 'A', 'Нефтепродукты'],
  ['SU26240RMFS0', 'ОФЗ 26240', 'AAA', 'Госдолг'],
  ['RU000A106T36', 'ВсеИнструменты 1Р-01', 'A', 'Ритейл'],
  ['RU000A107B43', 'Газпром Нефть 3Р-07', 'AAA', 'Нефть и газ'],
  ['RU000A105NL1', 'Делимобиль 1Р-01', 'A', 'Транспорт'],
  ['RU000A106E90', 'МТС 2Р-03', 'AAA', 'Телеком'],
  ['RU000A107RZ0', 'Селигдар ЗО26', 'A+', 'Золото'],
] as const;

function seeded(i: number) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export const BONDS: Bond[] = Array.from({ length: 36 }, (_, i) => {
  const [ticker, name, rating, sector] = NAMES[i % NAMES.length];
  const r = seeded(i + 1);
  const qty = Math.round(20 + r * 480);
  const price = 82 + seeded(i + 7) * 22;
  const value = qty * price * 10;
  return {
    ticker: i < NAMES.length ? ticker : `${ticker.slice(0, 9)}${(i * 37) % 1000}`,
    name: i < NAMES.length ? name : `${name} (${Math.floor(i / NAMES.length) + 1})`,
    rating,
    sector,
    ytm: 11 + seeded(i + 3) * 12,
    duration: 0.4 + seeded(i + 5) * 4.6,
    price,
    qty,
    value,
    change: (seeded(i + 11) - 0.45) * 4,
    status: rating === 'BBB' ? 'risk' : seeded(i + 13) > 0.78 ? 'watch' : 'ok',
  };
});

export const PORTFOLIO = MONTHS.map((m, i) => ({
  month: m,
  value: 980_000 + i * 24_000 + Math.round(Math.sin(i / 1.7) * 38_000),
  invested: 960_000 + i * 20_000,
}));

export const CASHFLOW = MONTHS.map((m, i) => ({
  month: m,
  coupons: 6_200 + Math.round(seeded(i + 2) * 4_000),
  amortization: i % 3 === 0 ? 9_000 + Math.round(seeded(i + 4) * 6_000) : Math.round(seeded(i + 4) * 2_500),
  redemptions: i === 4 || i === 9 ? 50_000 : 0,
}));

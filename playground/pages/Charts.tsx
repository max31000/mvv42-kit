import { SimpleGrid, Text } from '@mantine/core';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import { Page, Section } from '@mvv42/kit';
import { ChartFrame, ChartTooltip, chartColors, seriesColor, useChartTheme } from '@mvv42/kit/charts';
import { MONTHS, compactRub, rub } from './shared';

const SECTORS = [
  { name: 'Госдолг', value: 412_000 },
  { name: 'Девелопмент', value: 188_000 },
  { name: 'Лизинг', value: 154_000 },
  { name: 'Нефть и газ', value: 132_000 },
  { name: 'Металлургия', value: 118_000 },
  { name: 'Телеком', value: 96_000 },
  { name: 'Ритейл', value: 74_000 },
  { name: 'Транспорт', value: 61_000 },
];

const SERIES = ['Т-Банк', 'Сбер', 'ВТБ', 'Альфа'];
const BALANCES = MONTHS.map((m, i) => ({
  month: m,
  'Т-Банк': 320_000 + i * 9_000 + Math.sin(i) * 20_000,
  Сбер: 210_000 + i * 4_000 + Math.cos(i / 2) * 18_000,
  ВТБ: 140_000 + i * 6_500 + Math.sin(i / 3) * 12_000,
  Альфа: 90_000 + i * 3_000 + Math.cos(i) * 9_000,
}));

export function ChartsPage() {
  const t = useChartTheme();
  const total = SECTORS.reduce((s, x) => s + x.value, 0);
  return (
    <Page
      width="wide"
      title="Графики"
      description="Recharts + useChartTheme: одна сетка, одни оси, одна палитра. Цвет закреплён за сущностью, а не за позицией."
    >
      <Section title="Категориальная палитра" description="8 цветов, проверены на различимость (в т.ч. при дальтонизме) и контраст в светлой и тёмной теме">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 10 }}>
          {chartColors.series.map((c, i) => (
            <div key={c}>
              <div style={{ height: 40, borderRadius: 8, background: c, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)' }} />
              <Text size="xs" c="dimmed" mt={6} ff="monospace">
                --mvv-chart-{i + 1}
              </Text>
            </div>
          ))}
        </div>
      </Section>

      <ChartFrame title="Остатки по банкам" description="Четыре серии — легенда и подписи в цветах текста">
        <LineChart data={BALANCES} margin={t.margin}>
          <CartesianGrid {...t.grid} />
          <XAxis dataKey="month" {...t.xAxis} />
          <YAxis {...t.yAxis} tickFormatter={compactRub} />
          <Tooltip {...t.tooltip} content={<ChartTooltip valueFormatter={(v) => rub.format(Number(v))} />} />
          <Legend {...t.legend} />
          {SERIES.map((s, i) => (
            <Line key={s} {...t.line} dataKey={s} stroke={seriesColor(i)} />
          ))}
        </LineChart>
      </ChartFrame>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={12}>
        <ChartFrame title="Структура по отраслям" description="Доля в стоимости портфеля" height={280}>
          <BarChart data={SECTORS} layout="vertical" margin={{ ...t.margin, left: 8 }}>
            <CartesianGrid {...t.grid} horizontal={false} vertical />
            <XAxis type="number" {...t.xAxis} tickFormatter={compactRub} />
            <YAxis type="category" dataKey="name" {...t.yAxis} width={96} />
            <Tooltip
              {...t.barTooltip}
              content={<ChartTooltip valueFormatter={(v) => `${rub.format(Number(v))} · ${((Number(v) / total) * 100).toFixed(1)}%`} />}
            />
            <Bar dataKey="value" name="Стоимость" radius={[0, 4, 4, 0]} maxBarSize={18}>
              {SECTORS.map((s, i) => (
                <Cell key={s.name} fill={seriesColor(i)} />
              ))}
            </Bar>
          </BarChart>
        </ChartFrame>
        <ChartFrame title="Доли" description="Кольцо — только когда частей немного" height={280}>
          <PieChart>
            <Tooltip content={<ChartTooltip valueFormatter={(v) => rub.format(Number(v))} />} />
            <Legend {...t.legend} verticalAlign="middle" align="right" layout="vertical" height={undefined} />
            <Pie
              data={SECTORS.slice(0, 5)}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="86%"
              paddingAngle={1}
              stroke="var(--mvv-surface)"
              strokeWidth={2}
            >
              {SECTORS.slice(0, 5).map((s, i) => (
                <Cell key={s.name} fill={seriesColor(i)} />
              ))}
            </Pie>
          </PieChart>
        </ChartFrame>
      </SimpleGrid>
    </Page>
  );
}

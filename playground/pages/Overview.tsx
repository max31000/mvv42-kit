import { useState } from 'react';
import { Badge, Button, SegmentedControl, SimpleGrid, Table, Text } from '@mantine/core';
import { IconCalendarDollar, IconDownload, IconPercentage, IconStack2, IconWallet } from '@tabler/icons-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { Metric, MetricGrid, Page, Section } from '@mvv42/kit';
import { ChartFrame, ChartTooltip, chartColors, useChartTheme } from '@mvv42/kit/charts';
import { BONDS, CASHFLOW, PORTFOLIO, compactRub, num, pct, rub } from './shared';

const STATUS = {
  ok: { label: 'В норме', color: 'green' },
  watch: { label: 'Наблюдать', color: 'yellow' },
  risk: { label: 'Риск', color: 'red' },
} as const;

export function OverviewPage() {
  const [period, setPeriod] = useState('1y');
  const t = useChartTheme();
  const top = [...BONDS].sort((a, b) => b.value - a.value).slice(0, 6);

  return (
    <Page
      width="wide"
      eyebrow="Портфель «Основной»"
      title="Обзор портфеля"
      description="Стоимость, доходность и денежный поток по всем позициям. Данные биржи обновляются каждые 15 минут."
      actions={
        <>
          <SegmentedControl
            value={period}
            onChange={setPeriod}
            data={[
              { label: '3М', value: '3m' },
              { label: '6М', value: '6m' },
              { label: '1Г', value: '1y' },
              { label: 'Всё', value: 'all' },
            ]}
          />
          <Button variant="default" leftSection={<IconDownload size={16} stroke={1.75} />}>
            Экспорт
          </Button>
        </>
      }
    >
      <MetricGrid>
        <Metric
          label="Стоимость портфеля"
          value={rub.format(1_284_560)}
          delta={{ value: pct(3.2), tone: 'positive' }}
          hint="за 30 дней"
          icon={<IconWallet stroke={1.75} />}
        />
        <Metric
          label="Купонный доход"
          value={rub.format(96_400)}
          delta={{ value: pct(12.4), tone: 'positive' }}
          hint="за 12 месяцев"
          icon={<IconCalendarDollar stroke={1.75} />}
        />
        <Metric
          label="Доходность к погашению"
          value="14,8%"
          delta={{ value: pct(-0.6), tone: 'negative' }}
          hint="средневзв."
          icon={<IconPercentage stroke={1.75} />}
        />
        <Metric label="Позиций" value="23" delta={{ value: '0', tone: 'neutral' }} hint="7 эмитентов" icon={<IconStack2 stroke={1.75} />} />
      </MetricGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={12}>
        <ChartFrame
          title="Стоимость портфеля"
          description="Рыночная стоимость против вложенных средств"
          explanation="Разница между линиями — накопленная переоценка и реинвестированные купоны."
        >
          <AreaChart data={PORTFOLIO} margin={t.margin}>
            <defs>
              <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.series[0]} stopOpacity={0.22} />
                <stop offset="100%" stopColor={chartColors.series[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...t.grid} />
            <XAxis dataKey="month" {...t.xAxis} />
            <YAxis {...t.yAxis} tickFormatter={compactRub} domain={['dataMin - 40000', 'auto']} />
            <Tooltip {...t.tooltip} content={<ChartTooltip valueFormatter={(v) => rub.format(Number(v))} />} />
            <Legend {...t.legend} />
            <Area {...t.area} dataKey="value" name="Стоимость" stroke={chartColors.series[0]} fill="url(#pv)" fillOpacity={1} />
            <Area
              {...t.area}
              dataKey="invested"
              name="Вложено"
              stroke={chartColors.neutral}
              strokeDasharray="4 4"
              fill="transparent"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ChartFrame>

        <ChartFrame title="Денежный поток" description="Купоны, амортизация и погашения по месяцам">
          <BarChart data={CASHFLOW} margin={t.margin}>
            <CartesianGrid {...t.grid} />
            <XAxis dataKey="month" {...t.xAxis} />
            <YAxis {...t.yAxis} tickFormatter={compactRub} />
            <Tooltip
              {...t.barTooltip}
              content={<ChartTooltip valueFormatter={(v) => rub.format(Number(v))} />}
            />
            <Legend {...t.legend} />
            <Bar dataKey="coupons" name="Купоны" stackId="a" fill={chartColors.series[0]} />
            <Bar dataKey="amortization" name="Амортизация" stackId="a" fill={chartColors.series[1]} />
            <Bar dataKey="redemptions" name="Погашения" stackId="a" fill={chartColors.series[2]} {...t.bar} />
          </BarChart>
        </ChartFrame>
      </SimpleGrid>

      <Section
        title="Крупнейшие позиции"
        description="6 из 23 — по рыночной стоимости"
        padding="none"
        actions={
          <Button variant="subtle" size="xs" color="gray">
            Все позиции
          </Button>
        }
      >
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Выпуск</Table.Th>
              <Table.Th>Рейтинг</Table.Th>
              <Table.Th ta="right">YTM</Table.Th>
              <Table.Th ta="right">Дюрация</Table.Th>
              <Table.Th ta="right">Стоимость</Table.Th>
              <Table.Th ta="right">Изм.</Table.Th>
              <Table.Th>Статус</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {top.map((b) => (
              <Table.Tr key={b.ticker}>
                <Table.Td>
                  <Text size="sm" fw={500} lh={1.3}>
                    {b.name}
                  </Text>
                  <Text size="xs" c="dimmed" ff="monospace">
                    {b.ticker}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="outline" color="gray" size="sm">
                    {b.rating}
                  </Badge>
                </Table.Td>
                <Table.Td ta="right">{num.format(b.ytm)}%</Table.Td>
                <Table.Td ta="right">{num.format(b.duration)}</Table.Td>
                <Table.Td ta="right">{rub.format(b.value)}</Table.Td>
                <Table.Td ta="right">
                  <Text span size="sm" c={b.change >= 0 ? 'green' : 'red'}>
                    {pct(b.change, 2)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={STATUS[b.status].color} size="sm">
                    {STATUS[b.status].label}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Section>
    </Page>
  );
}

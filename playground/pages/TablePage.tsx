import { useMemo, useState } from 'react';
import { Badge, Group, Select, Table, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { EmptyState, Page, Section } from '@mvv42/kit';
import { BONDS, num, pct, rub } from './shared';

export function TablePage() {
  const [q, setQ] = useState('');
  const [rating, setRating] = useState<string | null>(null);
  const rows = useMemo(
    () =>
      BONDS.filter(
        (b) =>
          (!q || b.name.toLowerCase().includes(q.toLowerCase()) || b.ticker.includes(q.toUpperCase())) &&
          (!rating || b.rating === rating),
      ),
    [q, rating],
  );

  return (
    <Page width="wide" title="Позиции" description={`${BONDS.length} выпусков на 3 счетах`}>
      <Section
        padding="none"
        title="Все позиции"
        actions={
          <Group gap="xs" wrap="nowrap">
            <TextInput
              size="xs"
              placeholder="Поиск по названию или ISIN"
              leftSection={<IconSearch size={14} />}
              value={q}
              onChange={(e) => setQ(e.currentTarget.value)}
              w={240}
              aria-label="Поиск"
            />
            <Select
              size="xs"
              placeholder="Рейтинг"
              clearable
              data={['AAA', 'AA-', 'A+', 'A', 'A-', 'BBB']}
              value={rating}
              onChange={setRating}
              w={120}
              aria-label="Рейтинг"
            />
          </Group>
        }
      >
        {rows.length === 0 ? (
          <EmptyState compact title="Ничего не найдено" description="Измените запрос или сбросьте фильтр рейтинга." />
        ) : (
          <Table striped stickyHeader miw={860}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Выпуск</Table.Th>
                <Table.Th>Отрасль</Table.Th>
                <Table.Th>Рейтинг</Table.Th>
                <Table.Th ta="right">Цена</Table.Th>
                <Table.Th ta="right">Кол-во</Table.Th>
                <Table.Th ta="right">YTM</Table.Th>
                <Table.Th ta="right">Дюр.</Table.Th>
                <Table.Th ta="right">Стоимость</Table.Th>
                <Table.Th ta="right">Изм. за день</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((b) => (
                <Table.Tr key={b.ticker}>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {b.name}
                    </Text>
                  </Table.Td>
                  <Table.Td c="dimmed">{b.sector}</Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="outline" color={b.rating.startsWith('AA') ? 'gray' : b.rating === 'BBB' ? 'orange' : 'gray'}>
                      {b.rating}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="right">{num.format(b.price)}</Table.Td>
                  <Table.Td ta="right">{b.qty}</Table.Td>
                  <Table.Td ta="right">{num.format(b.ytm)}%</Table.Td>
                  <Table.Td ta="right">{num.format(b.duration)}</Table.Td>
                  <Table.Td ta="right" fw={500}>
                    {rub.format(b.value)}
                  </Table.Td>
                  <Table.Td ta="right" c={b.change >= 0 ? 'green' : 'red'}>
                    {pct(b.change, 2)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Section>
    </Page>
  );
}

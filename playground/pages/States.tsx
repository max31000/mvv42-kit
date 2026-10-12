import { Button, SimpleGrid } from '@mantine/core';
import { IconFileImport, IconPlus } from '@tabler/icons-react';
import { EmptyState, ErrorState, LoginRequired, Metric, MetricGrid, Page, Section } from '@mvv42/kit';
import { ApiError } from '@mvv42/kit/platform';
import { ChartFrame } from '@mvv42/kit/charts';
import { LineChart } from 'recharts';

export function StatesPage() {
  return (
    <Page title="Состояния" description="Пусто, ошибка, нет доступа, загрузка — одинаково во всех сервисах.">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={12}>
        <Section>
          <EmptyState
            title="Пока нет операций"
            description="Импортируйте выписку из банка или добавьте первую операцию вручную."
            action={
              <>
                <Button leftSection={<IconPlus size={16} />}>Добавить</Button>
                <Button variant="default" leftSection={<IconFileImport size={16} />}>
                  Импорт
                </Button>
              </>
            }
          />
        </Section>
        <Section>
          <ErrorState error={new ApiError(502, 'upstream_unavailable')} onRetry={() => undefined} />
        </Section>
        <Section>
          <ErrorState error={new ApiError(403, 'forbidden')} />
        </Section>
        <Section>
          <ErrorState title="Сеть недоступна" error={new Error('Failed to fetch')} onRetry={() => undefined} compact />
        </Section>
      </SimpleGrid>

      <MetricGrid cols={2}>
        <Metric label="Длинное значение" value="12 345 678 901 ₽" delta={{ value: '+1,2%', tone: 'positive' }} />
        <Metric label="Остаток долга" value="8 765 432,10 ₽" hint="на 1 ноября" />
      </MetricGrid>

      <MetricGrid cols={3}>
        <Metric label="Остаток на счетах" value="—" loading />
        <Metric label="Свободный поток" value="—" loading />
        <Metric label="Расходы за месяц" value="—" loading />
      </MetricGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={12}>
        <ChartFrame title="Загрузка графика" height={200} loading>
          <LineChart data={[]} />
        </ChartFrame>
        <ChartFrame title="Нет данных" height={200} empty>
          <LineChart data={[]} />
        </ChartFrame>
      </SimpleGrid>

      <Section variant="plain" title="LoginRequired" description="Экран, требующий входа (на скриншоте — анонимный пользователь)">
        <LoginRequired>
          <Section>
            <EmptyState title="Вы вошли" description="Здесь был бы защищённый контент." compact />
          </Section>
        </LoginRequired>
      </Section>
    </Page>
  );
}

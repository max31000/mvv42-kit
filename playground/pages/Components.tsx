import { useState } from 'react';
import {
  Accordion,
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Button,
  Checkbox,
  Group,
  Loader,
  Menu,
  Modal,
  NumberInput,
  Pagination,
  Progress,
  SegmentedControl,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconCheck,
  IconCircleCheck,
  IconDots,
  IconEdit,
  IconInfoCircle,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { Page, Section } from '@mvv42/kit';

export function ComponentsPage() {
  const [opened, setOpened] = useState(false);
  const [month, setMonth] = useState<string | null>('2026-10-01');

  return (
    <Page
      title="Компоненты"
      description="Mantine с темой кита: всё, из чего собираются экраны сервисов. Никаких своих стилей на страницах."
    >
      <Section title="Кнопки" description="filled — главное действие, default — вторичное, subtle — в таблицах и тулбарах">
        <Stack gap="md">
          <Group gap="xs">
            <Button leftSection={<IconPlus size={16} />}>Добавить позицию</Button>
            <Button variant="default">Отмена</Button>
            <Button variant="light">Light</Button>
            <Button variant="subtle">Subtle</Button>
            <Button variant="outline">Outline</Button>
            <Button color="red" variant="light" leftSection={<IconTrash size={16} />}>
              Удалить
            </Button>
            <Button loading>Загрузка</Button>
            <Button disabled>Недоступно</Button>
          </Group>
          <Group gap="xs">
            <Button size="xs">Маленькая</Button>
            <Button size="xs" variant="default">
              Маленькая
            </Button>
            <Button size="md">Крупная</Button>
            <Button color="green">Зелёная</Button>
            <Button color="orange">Оранжевая</Button>
            <Button color="blue">Синяя</Button>
            <ActionIcon aria-label="Изменить">
              <IconEdit size={18} stroke={1.75} />
            </ActionIcon>
            <ActionIcon variant="default" aria-label="Ещё">
              <IconDots size={18} stroke={1.75} />
            </ActionIcon>
            <ActionIcon variant="filled" aria-label="Добавить">
              <IconPlus size={18} stroke={2} />
            </ActionIcon>
          </Group>
        </Stack>
      </Section>

      <Section title="Формы" description="Подписи над полями, единая высота 36px, фокус в цвете сервиса">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
          <TextInput label="Название" placeholder="Например, «Подушка»" leftSection={<IconSearch size={16} />} />
          <NumberInput label="Сумма платежа" suffix=" ₽" thousandSeparator=" " defaultValue={54300} />
          <Select
            label="Счёт"
            placeholder="Выберите"
            defaultValue="t"
            data={[
              { value: 't', label: 'Т-Банк · Брокерский' },
              { value: 's', label: 'Сбер · ИИС' },
              { value: 'v', label: 'ВТБ · Брокерский' },
            ]}
          />
          <MonthPickerInput label="Месяц начала" value={month} onChange={setMonth} valueFormat="MMMM YYYY" />
          <NumberInput label="Ставка" description="Годовых, с учётом субсидии" suffix="%" decimalScale={2} defaultValue={6} />
          <TextInput label="Email" defaultValue="max@" error="Проверьте адрес" />
          <Textarea label="Комментарий" placeholder="Необязательно" autosize minRows={2} />
          <Stack gap="sm" justify="flex-end">
            <Switch label="Учитывать налог на купоны" defaultChecked />
            <Checkbox label="Реинвестировать купоны" defaultChecked />
            <Checkbox label="Показывать погашенные" />
          </Stack>
        </SimpleGrid>
        <Group mt="lg" gap="xs">
          <SegmentedControl data={['День', 'Неделя', 'Месяц', 'Год']} defaultValue="Месяц" />
          <SegmentedControl color="violet" data={['Аннуитет', 'Дифф.']} defaultValue="Аннуитет" />
        </Group>
      </Section>

      <Section title="Бейджи и статусы" description="Без капслока; цвет — только для смысла">
        <Stack gap="md">
          <Group gap={6}>
            <Badge>Accent</Badge>
            <Badge color="gray">Черновик</Badge>
            <Badge color="green">Оплачен</Badge>
            <Badge color="yellow">Ожидает</Badge>
            <Badge color="red">Просрочен</Badge>
            <Badge color="blue">Новый</Badge>
            <Badge color="grape">Флоатер</Badge>
            <Badge color="teal">Амортизация</Badge>
            <Badge variant="outline" color="gray">
              AAA
            </Badge>
            <Badge variant="dot" color="green">
              Онлайн
            </Badge>
            <Badge variant="filled">Filled</Badge>
            <Badge size="xs" color="orange">
              xs
            </Badge>
          </Group>
          <Group gap="sm">
            <ThemeIcon>
              <IconCircleCheck size={18} />
            </ThemeIcon>
            <ThemeIcon color="green">
              <IconCheck size={18} />
            </ThemeIcon>
            <ThemeIcon color="red">
              <IconX size={18} />
            </ThemeIcon>
            <Text size="sm">
              Текст с <Anchor href="#">ссылкой</Anchor>, <Text span c="green">ростом +2,4%</Text> и{' '}
              <Text span c="red">
                падением −1,1%
              </Text>
              .
            </Text>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <Alert color="blue" title="Обновление данных" icon={<IconInfoCircle size={18} />}>
              Котировки обновлены 4 минуты назад.
            </Alert>
            <Alert color="green" title="Импорт завершён" icon={<IconCircleCheck size={18} />}>
              Добавлено 128 операций, 3 пропущено.
            </Alert>
            <Alert color="yellow" title="Токен скоро истечёт" icon={<IconAlertTriangle size={18} />}>
              Обновите токен брокера в настройках до 20 октября.
            </Alert>
            <Alert color="red" title="Не удалось синхронизировать" icon={<IconX size={18} />} withCloseButton>
              Брокер вернул ошибку 502. Повторим автоматически.
            </Alert>
          </SimpleGrid>
        </Stack>
      </Section>

      <Section title="Навигация внутри страницы">
        <Tabs defaultValue="schedule">
          <Tabs.List>
            <Tabs.Tab value="schedule">График платежей</Tabs.Tab>
            <Tabs.Tab value="early">Досрочные</Tabs.Tab>
            <Tabs.Tab value="summary">Итоги</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="schedule" pt="md">
            <Text size="sm" c="dimmed">
              Подчёркнутые табы — для разделов внутри экрана.
            </Text>
          </Tabs.Panel>
        </Tabs>
        <Tabs defaultValue="all" variant="pills" mt="lg">
          <Tabs.List>
            <Tabs.Tab value="all">Все</Tabs.Tab>
            <Tabs.Tab value="ofz">ОФЗ</Tabs.Tab>
            <Tabs.Tab value="corp">Корпоративные</Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <Accordion variant="separated" mt="lg" defaultValue="a">
          <Accordion.Item value="a">
            <Accordion.Control>Как считается доходность к погашению?</Accordion.Control>
            <Accordion.Panel>
              Как ставка дисконтирования, при которой сумма будущих выплат равна текущей цене с НКД.
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="b">
            <Accordion.Control>Что такое дюрация?</Accordion.Control>
            <Accordion.Panel>Средневзвешенный срок до получения выплат.</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        <Group justify="center" mt="lg">
          <Pagination total={8} defaultValue={2} />
        </Group>
      </Section>

      <Section title="Наложения" description="Модальные окна, уведомления, подсказки и меню">
        <Group gap="xs">
          <Button variant="default" onClick={() => setOpened(true)}>
            Открыть модальное окно
          </Button>
          <Button
            variant="default"
            onClick={() =>
              notifications.show({
                title: 'Позиция добавлена',
                message: 'ОФЗ 26238 · 120 шт. на сумму 74 520 ₽',
                color: 'green',
                icon: <IconCheck size={16} />,
              })
            }
          >
            Уведомление
          </Button>
          <Tooltip label="Средневзвешенная по стоимости">
            <Button variant="subtle">Подсказка</Button>
          </Tooltip>
          <Menu>
            <Menu.Target>
              <Button variant="default" rightSection={<IconDots size={16} />}>
                Меню
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Позиция</Menu.Label>
              <Menu.Item leftSection={<IconEdit size={16} />}>Изменить</Menu.Item>
              <Menu.Item leftSection={<IconPlus size={16} />}>Докупить</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconTrash size={16} />}>
                Удалить
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        <Modal opened={opened} onClose={() => setOpened(false)} title="Новая операция">
          <Stack gap="md">
            <Select label="Тип" data={['Покупка', 'Продажа', 'Купон']} defaultValue="Покупка" />
            <NumberInput label="Количество" defaultValue={10} />
            <Group justify="flex-end" gap="xs" mt="xs">
              <Button variant="default" onClick={() => setOpened(false)}>
                Отмена
              </Button>
              <Button onClick={() => setOpened(false)}>Сохранить</Button>
            </Group>
          </Stack>
        </Modal>
      </Section>

      <Section title="Загрузка">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Stack gap={8}>
            <Skeleton height={14} width="70%" />
            <Skeleton height={14} />
            <Skeleton height={14} width="45%" />
          </Stack>
          <Stack gap="sm">
            <Group gap="sm">
              <Loader />
              <Text size="sm" c="dimmed">
                Считаем график платежей…
              </Text>
            </Group>
            <Progress value={64} />
            <Progress value={38} color="green" />
          </Stack>
        </SimpleGrid>
      </Section>
    </Page>
  );
}

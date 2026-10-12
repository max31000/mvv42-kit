import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DatesProvider } from '@mantine/dates';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mvv42/kit/styles.css';
import { IconChartCandle, IconComponents, IconLayoutDashboard, IconTable, IconAlertSquareRounded, IconChartBar } from '@tabler/icons-react';
import { Mvv42Provider, isMvv42Accent } from '@mvv42/kit';
import { AppLayout, type NavItem } from '@mvv42/kit/router';
import { OverviewPage } from './pages/Overview';
import { ComponentsPage } from './pages/Components';
import { TablePage } from './pages/TablePage';
import { StatesPage } from './pages/States';
import { ChartsPage } from './pages/Charts';
import { HeaderActions } from './pages/shared';

dayjs.locale('ru');

const params = new URLSearchParams(window.location.search);
const accentParam = params.get('accent');
const accent = isMvv42Accent(accentParam) ? accentParam : 'violet';
const insideShell = params.get('shell') === '1';

const nav: NavItem[] = [
  { label: 'Обзор', to: '/', icon: <IconLayoutDashboard stroke={1.75} /> },
  { label: 'Компоненты', to: '/components', icon: <IconComponents stroke={1.75} /> },
  { label: 'Таблица', to: '/table', icon: <IconTable stroke={1.75} /> },
  { label: 'Графики', to: '/charts', icon: <IconChartBar stroke={1.75} /> },
  { label: 'Состояния', to: '/states', icon: <IconAlertSquareRounded stroke={1.75} />, badge: 3 },
];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Mvv42Provider serviceId="playground" accent={accent} insideShell={insideShell}>
      <DatesProvider settings={{ locale: 'ru', firstDayOfWeek: 1 }}>
        <BrowserRouter>
          <AppLayout title="Bond Analytics" icon={<IconChartCandle stroke={1.9} />} nav={nav} actions={<HeaderActions />}>
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/components" element={<ComponentsPage />} />
              <Route path="/table" element={<TablePage />} />
              <Route path="/charts" element={<ChartsPage />} />
              <Route path="/states" element={<StatesPage />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </DatesProvider>
    </Mvv42Provider>
  </StrictMode>,
);

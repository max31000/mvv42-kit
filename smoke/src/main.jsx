import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Line, LineChart, XAxis } from 'recharts';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mvv42/kit/styles.css';
import { Metric, MetricGrid, Mvv42Provider, Page, Section } from '@mvv42/kit';
import { AppLayout } from '@mvv42/kit/router';
import { ChartFrame, chartColors, useChartTheme } from '@mvv42/kit/charts';
import { apiJson, useMe } from '@mvv42/kit/platform';

function Chart() {
  const t = useChartTheme();
  return (
    <ChartFrame title="Chart">
      <LineChart data={[{ x: 1, y: 2 }]}>
        <XAxis dataKey="x" {...t.xAxis} />
        <Line dataKey="y" stroke={chartColors.series[0]} {...t.line} />
      </LineChart>
    </ChartFrame>
  );
}

function App() {
  const { user } = useMe();
  void apiJson;
  return (
    <AppLayout title="Smoke" nav={[{ label: 'Home', to: '/' }]}>
      <Page title={user ? user.name : 'Smoke'}>
        <MetricGrid>
          <Metric label="A" value="1" />
        </MetricGrid>
        <Section title="S">ok</Section>
        <Chart />
      </Page>
    </AppLayout>
  );
}

createRoot(document.getElementById('root')).render(
  <Mvv42Provider serviceId="smoke" accent="blue">
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Mvv42Provider>,
);

// Minimal consumer: provider + one Button. Guards against the theme pulling every Mantine component in.
import { createRoot } from 'react-dom/client';
import { Button } from '@mantine/core';
import { Mvv42Provider } from '@mvv42/kit';

createRoot(document.getElementById('root')).render(
  <Mvv42Provider serviceId="size">
    <Button>Ok</Button>
  </Mvv42Provider>,
);

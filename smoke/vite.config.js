import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mvv42Html } from '@mvv42/kit/vite';

export default defineConfig({
  plugins: [react(), mvv42Html()],
  resolve: { dedupe: ['react', 'react-dom', '@mantine/core', '@mantine/hooks', '@mantine/notifications'] },
});

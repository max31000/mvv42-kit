import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { mvv42Html } from '../src/vite';

const src = (p: string) => fileURLToPath(new URL(`../src/${p}`, import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react(), mvv42Html()],
  resolve: {
    alias: [
      { find: '@mvv42/kit/styles.css', replacement: src('styles/index.css') },
      { find: '@mvv42/kit/router', replacement: src('router.ts') },
      { find: '@mvv42/kit/platform', replacement: src('platform.ts') },
      { find: '@mvv42/kit/charts', replacement: src('charts.ts') },
      { find: /^@mvv42\/kit$/, replacement: src('index.ts') },
    ],
    dedupe: ['react', 'react-dom', '@mantine/core', '@mantine/hooks', '@mantine/notifications'],
  },
  server: { host: '127.0.0.1', port: 5199, strictPort: true },
  preview: { host: '127.0.0.1', port: 5199, strictPort: true },
});

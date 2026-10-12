import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom', '@mantine/core', '@mantine/hooks', '@mantine/notifications'] },
  build: { outDir: 'dist-size', rollupOptions: { input: 'size.html' }, chunkSizeWarningLimit: 10_000 },
});

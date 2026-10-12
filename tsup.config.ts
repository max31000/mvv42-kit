import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    router: 'src/router.ts',
    platform: 'src/platform.ts',
    charts: 'src/charts.ts',
    vite: 'src/vite.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  // Shared chunks keep one copy of the context and the /me store across entries.
  splitting: true,
  treeshake: true,
  target: 'es2022',
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    /^@mantine\//,
    'react-router-dom',
    'react-router',
    'recharts',
    'vite',
  ],
});

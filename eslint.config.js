import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'playground/dist', 'node_modules', 'coverage', 'smoke'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/index.ts', 'src/components/**', 'src/theme/**', 'src/colorScheme/**', 'src/platform/**', 'src/*.tsx', 'src/useShellBridge.ts', 'src/tokens.ts', 'src/context.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react-router-dom', message: 'Core must not import the router — use @mvv42/kit/router.' },
            { name: 'react-router', message: 'Core must not import the router — use @mvv42/kit/router.' },
            { name: 'recharts', message: 'Core must not import recharts — use @mvv42/kit/charts.' },
          ],
          patterns: ['**/*.css'],
        },
      ],
    },
  },
);

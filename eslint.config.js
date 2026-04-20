import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite(),
  {
    files: ['**/*.{js,jsx}'],
    ...react.configs.flat['jsx-runtime'],
    languageOptions: {
      ...react.configs.flat['jsx-runtime'].languageOptions,
      globals: globals.browser,
    },
    rules: {
      ...react.configs.flat['jsx-runtime'].rules,
      'react/jsx-uses-vars': 'error',
    },
    settings: { react: { version: 'detect' } },
  },
  eslintConfigPrettier,
];

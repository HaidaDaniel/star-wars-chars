import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const reactHooksConfig = reactHooks.configs['recommended-latest']
const reactRefreshConfig = reactRefresh.configs.vite

export default defineConfig([
  globalIgnores([
    'dist',
    'build',
    'out',
    'coverage',
    'node_modules',
    '*.tsbuildinfo',
    '.eslintcache',
    '*.cache',
  ]),
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooksConfig.rules,
      ...reactRefreshConfig.rules,
    },
  },
])

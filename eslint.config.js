import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: [
      'dist/**',
      'dist-electron/**',
      'playwright-report/**',
      '**/screenshots/**'
    ]
  },
  // Base config for source & test code
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsParser,
      // We skip project lookup for speed & to avoid missing tsconfig references.
      parserOptions: { project: false },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest // test globals (describe, test, expect, vi, etc.)
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: Object.assign(
      {},
      js.configs.recommended?.rules ?? {},
      tsPlugin.configs.recommended?.rules ?? {},
      reactHooks.configs.recommended?.rules ?? {},
      reactRefresh.configs.vite?.rules ?? {},
      {
        // General relaxations to unblock refactor velocity; tighten later.
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-debugger': 'warn',
        // Typescript specific tweaks
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
        ],
        // TS handles undefined symbols; avoid false positives w/ types
        'no-undef': 'off'
      }
    )
  },
  // Declarations – allow ambient types without noise
  {
    files: ['**/*.d.ts'],
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  // Electron plain JS – allow require
  {
    files: ['electron/**/*.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off'
    }
  },
  // Test utilities sometimes export helpers alongside components; relax refresh rule
  {
    files: [
      'src/test/**',
      'src/__tests__/**',
      '**/*.test.{ts,tsx,js,jsx}'
    ],
    rules: {
      'react-refresh/only-export-components': 'off'
    }
  }
]

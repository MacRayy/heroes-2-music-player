import path from 'node:path'
import { fileURLToPath } from 'node:url'

import tsParser from '@typescript-eslint/parser'
import love from 'eslint-config-love'
import importPlugin from 'eslint-plugin-import'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import prettierPlugin from 'eslint-plugin-prettier'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = __dirname
const baseLanguageOptions = love.languageOptions ?? {}
const baseParserOptions = baseLanguageOptions.parserOptions ?? {}
const sharedRules = {
  ...love.rules,

  // Existing overrides from love
  '@typescript-eslint/unified-signatures': 'off',
  '@typescript-eslint/consistent-type-definitions': 'off',
  '@typescript-eslint/dot-notation': ['off'],
  '@typescript-eslint/no-magic-numbers': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/prefer-destructuring': 'off',
  'eslint-comments/require-description': 'off',
  'import/export': 0,
  'no-console': 'off',

  // TypeScript — conflict resolutions (relaxed from love defaults)
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      vars: 'all',
      args: 'after-used',
      ignoreRestSiblings: true,
      argsIgnorePattern: '^_',
    },
  ],
  '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
  'no-empty-function': 'off',
  '@typescript-eslint/no-empty-function': 'error',
  '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': 'allow-with-description' }],

  // TypeScript — additional rules
  '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
  '@typescript-eslint/consistent-type-exports': 'error',
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  '@typescript-eslint/no-unsafe-enum-comparison': 'error',
  '@typescript-eslint/adjacent-overload-signatures': 'error',
  '@typescript-eslint/consistent-indexed-object-style': 'error',
  '@typescript-eslint/prefer-for-of': 'error',
  '@typescript-eslint/prefer-function-type': 'error',
  '@typescript-eslint/no-inferrable-types': ['error', { ignoreProperties: true }],

  // Import
  'import/newline-after-import': ['error'],
  'import/no-duplicates': ['error'],

  // React
  'react/boolean-prop-naming': [
    'error',
    { rule: '^(is|has|should|can|are|have)[A-Z]([A-Za-z0-9]?)+' },
  ],
  'react/jsx-fragments': ['error', 'syntax'],
  'react/jsx-curly-brace-presence': ['error'],
  'react/jsx-curly-spacing': ['error'],
  'react/jsx-closing-bracket-location': ['error'],
  'react/jsx-closing-tag-location': ['error'],
  'react/jsx-tag-spacing': ['error'],
  'react/jsx-boolean-value': ['error'],
  'react/self-closing-comp': ['error'],
  'react/react-in-jsx-scope': 'off',
  'react/no-array-index-key': 'warn',
  'react/no-unstable-nested-components': 'error',

  // React Hooks
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'error',

  // General
  'eol-last': ['error', 'always'],
  curly: ['error', 'all'],
  // TypeScript — strict
  '@typescript-eslint/strict-boolean-expressions': 'error',
  '@typescript-eslint/switch-exhaustiveness-check': 'error',

  // Accessibility
  'jsx-a11y/no-static-element-interactions': 'error',
  'jsx-a11y/click-events-have-key-events': 'error',
  'jsx-a11y/anchor-is-valid': 'error',
  'jsx-a11y/no-autofocus': 'error',
  'jsx-a11y/alt-text': 'error',
}

const sharedPlugins = {
  ...love.plugins,
  react: reactPlugin,
  'react-hooks': reactHooksPlugin,
  'jsx-a11y': jsxA11yPlugin,
  prettier: prettierPlugin,
  import: importPlugin,
}

export default [
  {
    ignores: [
      '**/dist',
      '**/build',
      '**/node_modules',
      '.yarn',
      '**/*.config.js',
      '**/*.config.ts',
      '**/*.mjs',
      '**/*.d.ts',
      'public/**',
      'wiki/**',
      'scripts/**',
    ],
  },
  {
    ...love,
    files: ['**/*.{js,jsx}'],
    plugins: sharedPlugins,
    settings: { react: { version: 'detect' } },
    languageOptions: {
      ...baseLanguageOptions,
      parserOptions: {
        ...baseParserOptions,
      },
    },
    rules: sharedRules,
  },
  {
    ...love,
    files: ['**/*.{ts,tsx}'],
    plugins: sharedPlugins,
    settings: { react: { version: 'detect' } },
    languageOptions: {
      ...baseLanguageOptions,
      parser: tsParser,
      parserOptions: {
        ...baseParserOptions,
        projectService: true,
        tsconfigRootDir: projectRoot,
      },
    },
    rules: sharedRules,
  },
]

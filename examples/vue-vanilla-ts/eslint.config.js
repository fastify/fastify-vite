// ESLint v9+ Flat Config for Vue TypeScript Example
// Minimal config for Vue template linting only
// Temporary until oxlint Vue support lands (Q1 2026)
// Track: https://github.com/oxc-project/oxc/issues/15761
import pluginVue from 'eslint-plugin-vue'
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  ...tseslint.configs.recommended,

  // Base configuration for all JavaScript/TypeScript files (server-side defaults)
  {
    files: ['**/*.js', '**/*.ts', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
    },
  },

  // Vue SFC files with TypeScript
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
  },

  // Override for client-side code (isomorphic - adds browser globals for SSR)
  {
    files: ['src/client/**/*.ts', 'src/client/**/*.vue'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/html-closing-bracket-newline': 'off',
    },
  },

  // Ignore type declaration files
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  {
    ignores: ['**/build/**', '**/dist/**'],
  },
  eslintConfigPrettier,
]

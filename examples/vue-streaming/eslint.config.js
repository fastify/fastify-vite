// ESLint v9+ Flat Config for Vue Examples
// Minimal config for Vue template linting only
// Temporary until oxlint Vue support lands (Q1 2026)
// Track: https://github.com/oxc-project/oxc/issues/15761
import pluginVue from 'eslint-plugin-vue'
import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  
  // Base configuration for all JavaScript files (server-side defaults)
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
    },
  },

  // Override for client-side code (isomorphic - adds browser globals for SSR)
  {
    files: ['client/**/*.js', 'client/**/*.vue'],
    languageOptions: {
      globals: {
        ...globals.browser, // Add browser globals to the Node globals from base config
      },
    },
    rules: {
      // Vue-specific customizations
      'vue/multi-word-component-names': 'off',
      'vue/html-closing-bracket-newline': 'off',
    },
  },

  {
    ignores: ['**/build/**', '**/dist/**'],
  },
]

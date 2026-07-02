// @ts-check
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testMatch: ['**/e2e.mjs'],
  workers: 1,
  retries: 0,
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
})

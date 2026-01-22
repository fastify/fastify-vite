import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    threads: false,
    globalSetup: ['./fixtures/vitest.setup.js'],
  },
})

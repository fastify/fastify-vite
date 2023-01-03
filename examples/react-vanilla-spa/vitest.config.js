import { dirname } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: dirname(new URL(import.meta.url).pathname),
  test: {
    testTimeout: 15000,
  }
})

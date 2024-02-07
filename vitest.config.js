import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: dirname(new URL(import.meta.url).pathname),
  test: {
    testTimeout: 20000,
    threads: false,
  },
})

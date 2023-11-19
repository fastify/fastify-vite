import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    root: dirname(fileURLToPath(import.meta.url)),
    testTimeout: 15000
  },
  externalizeDeps: {
    exclude: ['@sveltejs/vite-plugin-svelte'],
  }
})

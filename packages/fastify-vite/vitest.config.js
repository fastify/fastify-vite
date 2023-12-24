import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: process.cwd(),
  base: process.cwd(),
  test: {
    threads: false
  }
})

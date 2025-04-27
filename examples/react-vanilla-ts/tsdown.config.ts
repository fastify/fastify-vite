import { join } from 'node:path'
import { defineConfig } from 'tsdown/config'

export default defineConfig({
  entry: join(import.meta.dirname, 'src', 'server.ts'),
  outDir: join(import.meta.dirname, 'build'),
})
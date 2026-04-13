import { resolve } from 'node:path'
import viteFastifyTanstack from '@fastify/tanstack/plugin'

export default {
  root: resolve(import.meta.dirname, 'src', 'client'),
  plugins: [viteFastifyTanstack()],
  build: {
    emptyOutDir: true,
    outDir: resolve(import.meta.dirname, 'build'),
  },
}

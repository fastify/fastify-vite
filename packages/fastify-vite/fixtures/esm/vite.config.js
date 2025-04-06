import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import viteFastify from '@fastify/vite/plugin'

if (!globalThis.port) {
  globalThis.port = 7981
}

export default () => ({
  root: dirname(fileURLToPath(new URL(import.meta.url))),
  plugins: [viteFastify()],
  server: {
    hmr: {
      port: globalThis.port++,
    },
  },
})

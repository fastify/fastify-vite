import { join } from 'node:path'
import viteFastifyVue from '@fastify/vue/plugin'
import viteVue from '@vitejs/plugin-vue'

if (!globalThis.port) {
  globalThis.port = 7981
}

export default {
  root: join(import.meta.dirname, 'client'),
  plugins: [viteFastifyVue(), viteVue()],
  build: { emptyOutDir: true },
  server: {
    hmr: {
      port: globalThis.port++,
    },
  },
}

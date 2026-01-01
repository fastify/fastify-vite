import { join } from 'node:path'
import viteFastifyPlugin from '@fastify/vite/plugin'
import vuePlugin from '@vitejs/plugin-vue'

export default {
  root: join(import.meta.dirname, 'client'),
  plugins: [viteFastifyPlugin({ spa: true }), vuePlugin()],
}

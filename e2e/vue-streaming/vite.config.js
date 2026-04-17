import { resolve } from 'node:path'
import { viteFastify } from '@fastify/vite/plugin'
import vuePlugin from '@vitejs/plugin-vue'

export default {
  root: resolve(import.meta.dirname, 'client'),
  plugins: [viteFastify(), vuePlugin()],
}

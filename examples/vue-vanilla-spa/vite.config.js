import { join } from 'node:path'
import viteFastify from '@fastify/vite/plugin'
import vuePlugin from '@vitejs/plugin-vue'

export default {
  root: join(import.meta.dirname, 'client'),
  plugins: [
    viteFastify(), 
    vuePlugin()
  ],
}

import { join } from 'node:path'
import viteVue from '@vitejs/plugin-vue'
import viteFastify from '@fastify/vite/plugin'
import viteFastifyVue from '@fastify/vue/plugin'

export default {
  root: join(import.meta.dirname, 'client'),
  plugins: [
    viteVue(), 
    viteFastify(),
    viteFastifyVue(),
  ],
}

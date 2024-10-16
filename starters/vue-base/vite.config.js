import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import viteVue from '@vitejs/plugin-vue'
import viteFastify from '@fastify/vite/plugin'
import viteFastifyVue from '@fastify/vue/plugin'

const path = fileURLToPath(import.meta.url)

export default {
  root: join(dirname(path), 'client'),
  plugins: [
    viteVue(), 
    viteFastify(),
    viteFastifyVue(),
  ],
}

import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import viteVue from '@vitejs/plugin-vue'
import viteFastifyVue from '@fastify/vue/plugin'
import unocss from 'unocss/vite'

const path = fileURLToPath(import.meta.url)

export default {
  root: join(dirname(path), 'client'),
  plugins: [
    viteVue(), 
    unocss(),
    viteFastifyVue(),
  ]
}

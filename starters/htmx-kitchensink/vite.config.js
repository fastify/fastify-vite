import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import viteVue from '@vitejs/plugin-vue'
import viteFastifyHtmx from '@fastify/htmx/plugin'
import unocss from 'unocss/vite'

export default {
  root: join(dirname(fileURLToPath(import.meta.url)), 'client'),
  plugins: [
    viteVue(), 
    unocss(),
    viteFastifyHtmx(),
  ]
}

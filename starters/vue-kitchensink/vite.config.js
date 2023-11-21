import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import viteVue from '@vitejs/plugin-vue'
import fastifyVue from '@fastify/vue/plugin'
import unocss from 'unocss/vite'

const path = fileURLToPath(import.meta.url)

const root = join(dirname(path), 'client')
const plugins = [
  viteVue(), 
  unocss(),
  fastifyVue(),
]

export default {
  root,
  plugins,
}

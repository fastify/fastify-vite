import { join, dirname } from 'path'
import viteVue from '@vitejs/plugin-vue'
// import viteVueJsx from '@vitejs/plugin-vue-jsx'
import viteFastify from 'fastify-vite/plugin'

// @type {import('vite').UserConfig}
export default {
  root: join(dirname(new URL(import.meta.url).pathname), 'client'),
  plugins: [
    viteVue(),
    // viteVueJsx(),
    viteFastify()
  ]
}

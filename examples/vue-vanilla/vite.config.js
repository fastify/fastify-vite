import { resolve, dirname } from 'path'
import vite from 'vite'
import vuePlugin from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import viteFastify from 'fastify-vite/plugin'

export const root = resolve(dirname(new URL(import.meta.url).pathname), 'client')

export const plugins = [
  vuePlugin(),
  vueJsx(),
  viteFastify(),
]

export default vite.defineConfig({ root, plugins })

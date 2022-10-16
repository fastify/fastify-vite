import { resolve, dirname } from 'path'
import { defineConfig } from 'vite'
import viteFastify from 'fastify-vite/plugin'
import vuePlugin from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

const path = new URL(import.meta.url).pathname
const root = resolve(dirname(path), 'client')

const plugins = [
  vuePlugin(),
  vueJsx(),
  viteFastify(),
]

export default { 
  root,
  plugins
}

import { resolve, dirname } from 'path'
import { defineConfig } from 'vite'
import viteFastify from 'fastify-vite/plugin'
import vuePlugin from '@vitejs/plugin-vue'

const path = new URL(import.meta.url).pathname
const root = resolve(dirname(path), 'client')

const plugins = [
  vuePlugin(),
  viteFastify(),
]

export default { 
  root,
  plugins
}

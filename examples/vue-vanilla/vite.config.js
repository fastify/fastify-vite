import { resolve, dirname } from 'path'
import { defineConfig } from 'vite'
import { createRequire } from 'module'
import viteFastify from 'fastify-vite/plugin'

const require = createRequire(import.meta.url)
const path = new URL(import.meta.url).pathname
const root = resolve(dirname(path), 'client')

const vuePlugin = require('@vitejs/plugin-vue')
const vueJsx = require('@vitejs/plugin-vue-jsx')

const plugins = [
  vuePlugin(),
  vueJsx(),
  viteFastify(),
]

export default { 
  root,
  plugins
}

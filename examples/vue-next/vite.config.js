import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { viteFastify } from '@fastify/vite'
import vuePlugin from '@vitejs/plugin-vue'

const path = fileURLToPath(import.meta.url)
const root = resolve(dirname(path), 'client')

const plugins = [
  viteFastify(),
  vuePlugin()
]

export default defineConfig({
  root,
  plugins
})

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'

const path = fileURLToPath(new URL(import.meta.url))
const root = resolve(dirname(path), 'client')

const plugins = [
  vuePlugin()
]

export default {
  root,
  plugins
}

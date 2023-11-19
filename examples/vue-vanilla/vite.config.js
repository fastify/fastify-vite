import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import vuePlugin from '@vitejs/plugin-vue'

const path = fileURLToPath(import.meta.url)
const root = resolve(dirname(path), 'client')

const plugins = [
  vuePlugin()
]

export default {
  root,
  plugins
}

import { resolve, dirname } from 'path'
import vuePlugin from '@vitejs/plugin-vue'

const path = new URL(import.meta.url).pathname
const root = resolve(dirname(path), 'client')

const plugins = [
  vuePlugin(),
]

export default { 
  root,
  plugins
}

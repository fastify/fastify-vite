import { resolve, dirname } from 'path'
import viteReact from '@vitejs/plugin-react'

const path = new URL(import.meta.url).pathname
const root = resolve(dirname(path), 'client')

const plugins = [
  viteReact({ jsxRuntime: 'classic' }),
]

export default {
  root,
  plugins,
}

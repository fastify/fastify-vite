import { resolve, dirname } from 'path'
import viteReact from '@vitejs/plugin-react'
import viteFastify from 'fastify-vite/plugin'

const path = new URL(import.meta.url).pathname
const root = resolve(dirname(path), 'client')

const plugins = [
  viteReact({ jsxRuntime: 'classic' }),
  viteFastify(),
]

export default {
  root,
  plugins
}

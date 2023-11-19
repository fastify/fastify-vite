import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import viteReact from '@vitejs/plugin-react'

const path = fileURLToPath(import.meta.url)
const root = resolve(dirname(path), 'client')

const plugins = [
  viteReact({ jsxRuntime: 'classic' })
]

export default {
  root,
  plugins,
}
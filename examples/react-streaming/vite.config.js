import { join, dirname } from 'path'
import viteReact from '@vitejs/plugin-react'
import viteFastify from 'fastify-vite/plugin'

// @type {import('vite').UserConfig}
export default {
  root: join(dirname(new URL(import.meta.url).pathname), 'client'),
  plugins: [
    viteReact({ jsxRuntime: 'classic' }),
    viteFastify(),
  ],
}

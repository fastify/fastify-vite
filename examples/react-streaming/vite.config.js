import viteReact from '@vitejs/plugin-react'
import viteFastify from 'fastify-vite/plugin'

// @type {import('vite').UserConfig}
export default {
  root: './client',
  plugins: [
    viteReact({ jsxRuntime: 'classic' }),
    viteFastify(),
  ],
}

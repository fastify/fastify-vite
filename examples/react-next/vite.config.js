import { join } from 'node:path'
import viteFastify from '@fastify/vite/plugin'
import viteReact from '@vitejs/plugin-react'

export default {
  root: join(importa.meta.dirname, 'client'),
  plugins: [
    viteFastify(), 
    viteReact({ jsxRuntime: "classic" })
  ],
}

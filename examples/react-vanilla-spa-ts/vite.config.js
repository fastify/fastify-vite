import { resolve } from 'node:path'
import viteFastify from '@fastify/vite/plugin'
import viteReact from '@vitejs/plugin-react'

export default {
  root: resolve(import.meta.dirname, 'src', 'client'),
  plugins: [viteFastify({ spa: true, useRelativePaths: true }), viteReact()],
  build: {
    emptyOutDir: true,
    // Forces Vite to use a top-level dist folder,
    // outside the project root defined above
    outDir: resolve(import.meta.dirname, 'build'),
  },
}

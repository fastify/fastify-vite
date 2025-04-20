import { join, resolve } from 'node:path'
import { defineConfig } from 'vite'

import viteFastifyReactPlugin from '@fastify/react/plugin'
import viteReactPlugin from '@vitejs/plugin-react'

export default defineConfig({
  root: join(import.meta.dirname, 'src', 'client'),
  plugins: [
    viteReactPlugin(),
    viteFastifyReactPlugin(),
  ],
  build: {
    outDir: 'dist'
  },
})

import { join, resolve } from 'node:path'
import { defineConfig } from 'vite'

import viteFastifyReactPlugin from '@fastify/react/plugin'
import viteReactPlugin from '@vitejs/plugin-react'

export default defineConfig({
  root: join(import.meta.dirname, 'client'),
  plugins: [
    viteReactPlugin(),
    viteFastifyReactPlugin(),
  ],
  environments: {
    client: {
      build: {
        outDir: resolve(import.meta.dirname, '..', 'dist/client'),
      }
    },
    ssr: {
      build: {
        outDir: resolve(import.meta.dirname, '..', 'dist/server'),
      }
    }
  }
})

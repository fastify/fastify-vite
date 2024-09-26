import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import viteReact from '@vitejs/plugin-react'
import viteFastify from '@fastify/vite/plugin'
import fastifyReact from '@fastify/react/plugin'

const path = fileURLToPath(import.meta.url)

export default {
  root: join(dirname(path), 'client'),
  plugins: [
    viteReact(),
    viteFastify(),
    fastifyReact(),
  ],
  ssr: {
    external: [
      'use-sync-external-store'
    ]
  },
}

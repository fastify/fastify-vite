import { join } from 'node:path'

import viteReact from '@vitejs/plugin-react'
import viteFastifyReact from '@fastify/react/plugin'

export default {
  root: join(import.meta.dirname, 'client'),
  plugins: [
    viteReact(),
    viteFastifyReact(),
  ],
  ssr: {
    external: [
      'use-sync-external-store'
    ]
  },
}

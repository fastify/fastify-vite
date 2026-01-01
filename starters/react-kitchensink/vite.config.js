import { resolve } from 'node:path'

import viteReact from '@vitejs/plugin-react'
import viteFastifyReact from '@fastify/react/plugin'

export default {
  root: resolve(import.meta.dirname, 'client'),
  plugins: [viteReact(), viteFastifyReact()],
  ssr: {
    external: ['use-sync-external-store'],
  },
}

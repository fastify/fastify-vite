import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import viteReact from '@vitejs/plugin-react'
import viteFastifyReact from '@fastify/react/plugin'

export default {
  root: join(import.meta.dirname, 'client'),
  plugins: [
    viteReact(),
    viteFastifyReact({ 
      ts: true
    }),
  ],
}

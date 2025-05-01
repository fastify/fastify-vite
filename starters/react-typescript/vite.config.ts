import { join } from 'path'

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

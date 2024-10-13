import { join } from 'node:path'
import viteFastify from '@fastify/vite/plugin'
import viteSolid from 'vite-plugin-solid'

export default {
  root: join(import.meta.dirname, 'client'),
  plugins: [
    viteFastify(), 
    viteSolid({ ssr: true })
  ],
}

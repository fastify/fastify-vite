import { join } from 'node:path'
import viteFastifyHtmx from '@fastify/htmx/plugin'

export default {
  root: join(import.meta.dirname, 'client'),
  plugins: [
    viteFastifyHtmx()
  ],
}

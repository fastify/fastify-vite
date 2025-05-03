import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import viteFastifyHtmx from '@fastify/htmx/plugin'

export default {
  root: join(dirname(fileURLToPath(import.meta.url)), 'client'),
  plugins: [
    viteFastifyHtmx()
  ],
}

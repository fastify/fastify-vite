import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import inject from '@rollup/plugin-inject'
import viteFastifyHtmx from '@fastify/htmx/plugin'

export default {
  root: join(dirname(fileURLToPath(import.meta.url)), 'client'),
  plugins: [
    viteFastifyHtmx()
  ],
  build: {
    assetsInlineLimit: 0,
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
}

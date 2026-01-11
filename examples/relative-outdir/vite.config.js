import { join } from 'node:path'
import viteFastify from '@fastify/vite/plugin'

// This configuration demonstrates issue #303:
// When root is nested (src/client) and build.outDir uses a relative path,
// the vite.config.json is written to a location that the production
// runtime cannot find.
//
// Written to: dist/build/vite.config.json
// Looking in: dist/vite.config.json (not found)
//        then: client/dist/vite.config.json (not found)

export default {
  root: join(import.meta.dirname, 'src/client'),
  build: {
    outDir: '../../dist/build',
  },
  plugins: [viteFastify({ spa: true, useRelativePaths: true })],
}

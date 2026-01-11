import test from 'node:test'
import { makeBuildTest, makeIndexTest } from '../test-factories.mjs'
import { main } from './server.js'

const cwd = import.meta.dirname

// This test reproduces issue #303:
// https://github.com/fastify/fastify-vite/issues/303
//
// When using a nested root with a relative outDir, the vite.config.json
// is written to a location that the production runtime cannot find.

test('relative-outdir (issue #303)', async (t) => {
  await t.test('build production bundle', makeBuildTest({ cwd }))
  await t.test('render index page in production', makeIndexTest({ main }))
})

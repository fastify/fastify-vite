import test from 'node:test'
import { makeBuildTest, makeIndexTest } from '../../test-factories.mjs'
import { main } from './server.ts'
import { resolve } from 'node:path'

test('vue-vanilla', async (t) => {
  await t.test(
    'build production bundle',
    makeBuildTest({ cwd: resolve(import.meta.dirname, '..') }),
  )
  await t.test('render index page in development', makeIndexTest({ main, dev: true }))
  await t.test('render index page in production', makeIndexTest({ main, dev: false }))
})

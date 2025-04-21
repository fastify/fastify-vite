import test from 'node:test'
import { makeBuildTest, makeIndexTest } from '../../test-factories.mjs'
import { main } from './server.ts'
import { join } from 'node:path'

const cwd = join(import.meta.dirname, '..')

test('vue-vanilla', async (t) => {
  await t.test('build production bundle', makeBuildTest({ cwd }))
  await t.test('render index page in development', makeIndexTest({ main, dev: true }))
  await t.test('render index page in production', makeIndexTest({ main, dev: false }))
})
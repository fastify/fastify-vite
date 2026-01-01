import test from 'node:test'
import { makeBuildTest, makeIndexTest } from '../test-factories.mjs'
import { main } from './src/server.ts'

const cwd = import.meta.dirname

test('vue-vanilla', async (t) => {
  await t.test('build production bundle', makeBuildTest({ cwd }))
  await t.test('render index page in production', makeIndexTest({ main, dev: false }))
  await t.test('render index page in development', makeIndexTest({ main, dev: true }))
})

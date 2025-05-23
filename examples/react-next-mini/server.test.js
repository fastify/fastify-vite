import test from 'node:test'
import { makeBuildTest, makeIndexTest } from '../test-factories.mjs'
import { main } from './server.js'

const cwd = import.meta.dirname

test('react-next-mini', async (t) => {
  await t.test('build production bundle', makeBuildTest({ cwd }))
  await t.test('render index page in production', makeIndexTest({ main }))
  await t.test('render index page in development', makeIndexTest({ main, dev: true }))
})
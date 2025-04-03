import test from 'node:test'
import { makeSPABuildTest, makeIndexTest } from '../test-factories.mjs'
import { main } from './server.js'

const cwd = import.meta.dirname

test('vue-vanilla-spa', async (t) => {
  await t.test('build production bundle', makeSPABuildTest({ cwd }))
  await t.test('render index page in production', makeIndexTest({ main }))
  await t.test('render index page in development', makeIndexTest({ main, dev: true }))
})
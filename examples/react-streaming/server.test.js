import test from 'node:test'
import { makeSSRBuildTest, makeIndexTest } from '../test-factories.mjs'
import { main } from './server.js'

const cwd = import.meta.dirname

test('react-streaming', async (t) => {
  await t.test('render index page in development', makeIndexTest({ main, dev: true }))
  await t.test('build production bundle', makeSSRBuildTest({ cwd }))
  await t.test('render index page in production', makeIndexTest({ main }))
})

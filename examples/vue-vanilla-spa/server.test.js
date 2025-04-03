import test from 'node:test'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { makeIndexTest, makeBuildTest } from '../test-factories.mjs'
import { main } from './server.js'

const cwd = import.meta.dirname

test('vue-vanilla-spa', async (t) => {
  await t.test('build production bundle', makeBuildTest({ cwd }))
  await t.test('render index page in production', makeIndexTest({ main }))
  await t.test('render index page in development', makeIndexTest({ main, dev: true }))
})
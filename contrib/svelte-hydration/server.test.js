import test from 'node:test'
import { setTimeout } from 'node:timers/promises'

import { makeSSRBuildTest, makeIndexTest } from '../test-factories.mjs'
import { main } from './server.js'

const cwd = import.meta.dirname

test('svelte-hydration', async (t) => {
  await t.test('build production bundle', makeSSRBuildTest({ cwd }))
  await t.test('render index page in production', makeIndexTest({ main }))
  await setTimeout(1000)
  await t.test('render index page in development', makeIndexTest({ main, dev: true }))
})

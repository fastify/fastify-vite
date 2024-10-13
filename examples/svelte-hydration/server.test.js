import test from 'node:test'
import { setTimeout } from 'node:timers/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { makeSSRBuildTest, makeIndexTest } from '../test-factories.mjs'
import { main } from './server.js'

const cwd = dirname(fileURLToPath(import.meta.url))

test('svelte-hydration', async (t) => {
  await t.test('build production bundle', makeSSRBuildTest({ cwd, clientModules: 25, serverModules: 23 }))
  await t.test('render index page in production', makeIndexTest({ main }))
  await setTimeout(1000)
  await t.test('render index page in development', makeIndexTest({ main, dev: true }))
})

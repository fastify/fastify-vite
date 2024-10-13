import test from 'node:test'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { makeIndexTest, makeSPABuildTest } from '../test-factories.mjs'
import { main } from './server.js'

const cwd = dirname(fileURLToPath(import.meta.url))

test('react-vanilla-spa', async (t) => {
  await t.test('build production bundle', makeSPABuildTest({ cwd, clientModules: 25 }))
  await t.test('render index page in development', makeIndexTest({ main, dev: true }))
  await t.test('render index page in production', makeIndexTest({ main }))
})

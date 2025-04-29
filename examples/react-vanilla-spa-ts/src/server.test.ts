import test from 'node:test'
import { resolve } from 'node:path'
import { makeBuildTest, makeIndexTest } from '../../test-factories.mjs'
import { main } from './server.ts'

const viteConfigLocation = resolve(import.meta.dirname, '..')

test('react-vanilla-spa-ts', async (t) => {
  await t.test('build production bundle', makeBuildTest({ cwd: viteConfigLocation }))
  await t.test('render index page in production', makeIndexTest({ main, dev: false }))
  await t.test('render index page in development', makeIndexTest({ main, dev: true }))
})

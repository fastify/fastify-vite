import test from 'node:test'
import { makeBuildTest, makeIndexTest } from '../../test-factories.mjs'
import { main } from './server.ts'

const cwd = import.meta.dirname

test('react-vanilla-ts-src', async (t) => {
  await t.test('build production bundle', makeBuildTest({ cwd }))
  // @ts-ignore
  await t.test('render index page in production', makeIndexTest({ main }))
  await t.test('render index page in development', makeIndexTest({ main, dev: true }))
})
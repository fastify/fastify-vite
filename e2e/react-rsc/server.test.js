import test from 'node:test'
import { makeBuildTest, makeIndexTest, makeStartFromOutsideTest } from '../test-factories.mjs'
import { main } from './server.js'

const cwd = import.meta.dirname

test('react-rsc', async (t) => {
  await t.test('build production bundle (RSC build)', makeBuildTest({ cwd }))
  await t.test(
    'render index page in production (depends on build)',
    { skip: true },
    makeIndexTest({ main }),
  )
  await t.test('render index page in development', makeIndexTest({ main, dev: true }))
  await t.test('start from monorepo root', makeStartFromOutsideTest({ main, dev: true }))
})

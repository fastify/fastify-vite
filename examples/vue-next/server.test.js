import test from 'node:test'
import { makeSSRBuildTest, makeIndexTest } from '../test-factories.mjs'
import { main } from './server.js'

const cwd = import.meta.dirname

test('render index page in development', makeIndexTest({ main, dev: true }))
test('build production bundle', makeSSRBuildTest({ cwd }))
test('render index page in production', makeIndexTest({ main }))

import { dirname } from 'node:path'
import { test } from 'vitest'
import { makeIndexTest, makeSPABuildTest } from '../../testing.js'
import { main } from './server.js'

const cwd = dirname(new URL(import.meta.url).pathname)

test('render index page in development', makeIndexTest({ main, dev: true }))
test('build production bundle', makeSPABuildTest({ cwd, clientModules: 25 }))
test('render index page in production', makeIndexTest({ main }))

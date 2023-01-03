import { join, resolve, dirname } from 'node:path'
import { beforeAll, afterAll, assert, expect, test } from 'vitest'
import { makeSSRBuildTest, makeIndexTest } from '../../testing.js'
import { main } from './server.js' 

const cwd = dirname(new URL(import.meta.url).pathname)

test('render index page in development', makeIndexTest({ main, dev: true }))
test('build production bundle', makeSSRBuildTest({ cwd, clientModules: 37, serverModules: 6 }))
test('render index page in production', makeIndexTest({ main }))

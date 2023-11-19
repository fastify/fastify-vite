import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, afterAll, assert, expect, test } from 'vitest'
import { makeSSRBuildTest, makeIndexTest } from '../test-factories.js'
import { main } from './server.js'

const cwd = dirname(fileURLToPath(import.meta.url))

test('render index page in development', makeIndexTest({ main, dev: true }))
test('build production bundle', makeSSRBuildTest({ cwd, clientModules: 37, serverModules: 9 }))
test('render index page in production', makeIndexTest({ main }))

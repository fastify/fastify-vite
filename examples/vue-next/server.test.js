
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, afterAll, assert, expect, test } from 'vitest'
import { makeSSRBuildTest, makeIndexTest } from '../../testing.js'
import { main } from './server.js'

const cwd = dirname(fileURLToPath(new URL(import.meta.url)))

test('render index page in development', makeIndexTest({ main, dev: true }))
test('build production bundle', makeSSRBuildTest({ cwd, clientModules: 33, serverModules: 12 }))
test('render index page in production', makeIndexTest({ main }))

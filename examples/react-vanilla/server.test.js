import test from 'node:test'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { WebSocketServer } from 'ws'
import { makeSSRBuildTest, makeIndexTest } from '../test-factories.mjs'
import { main } from './server.js'

const cwd = dirname(fileURLToPath(import.meta.url))

test('render index page in development', () => makeIndexTest({ main, dev: true }))
test('build production bundle', makeSSRBuildTest({ cwd, clientModules: 25, serverModules: 2 }))
test('render index page in production', makeIndexTest({ main }))

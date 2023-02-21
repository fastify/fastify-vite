import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, afterAll, assert, expect, test, vi } from 'vitest'
import { WebSocketServer } from 'ws'
import { makeSSRBuildTest, makeIndexTest } from '../../testing.js'

const cwd = dirname(fileURLToPath(new URL(import.meta.url)))

let main
let spy

beforeAll(async () => {
  vi.mock('ws', () => ({
    WebSocketServer: () => {
      console.log('Foobar')
      return ({
        on: () => {}
      })
    }
  }))
  const server = await import('./server.js')
  main = server.main
})

afterAll(() => {
  vi.restoreAllMocks()
})

test('render index page in development', () => makeIndexTest({ main, dev: true }))

// test('build production bundle', makeSSRBuildTest({ cwd, clientModules: 25, serverModules: 2 }))
// test('render index page in production', makeIndexTest({ main }))

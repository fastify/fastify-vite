import { test } from 'vitest'
import { makeIndexTest } from '../../testing.js'
import { main } from './server.js'

test('render index page in development', makeIndexTest({ main, dev: true }))
test('render index page in production', makeIndexTest({ main }))

import { readFile } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'

import { beforeAll, assert, expect, test } from 'vitest'
import { execaCommand } from 'execa'

import { main } from './server.js'

const cwd = dirname(new URL(import.meta.url).pathname)

test('render index page in development mode', async () => {
  const server = await main(true)
  const response = await server.inject({ method: 'GET', url: '/' })
  expect(response.statusCode).toBe(200)
 })

test('build production bundle', async () => {
  const {
    scripts: {
      ['build:client']: buildClient,
      ['build:server']: buildServer
    }
  } = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8'))
  
  const { stdout: clientStdout } = await execaCommand(`npx ${buildClient}`, { cwd })
  const { stdout: serverStdout } = await execaCommand(`npx ${buildServer}`, { cwd })

  expect(clientStdout).toContain('✓ 11 modules transformed')
  expect(serverStdout).toContain('✓ 4 modules transformed')
 })

test('render index page in production mode', async () => {
  const server = await main(false)
  const response = await server.inject({ method: 'GET', url: '/' })
  expect(response.statusCode).toBe(200)
 })

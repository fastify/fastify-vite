import { execSync } from 'node:child_process'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { main } from './server.js'

const fixtureRoot = import.meta.dirname

describe('production mode', () => {
  let server
  let originalCwd

  beforeAll(async () => {
    execSync('pnpm build', { cwd: fixtureRoot, stdio: 'inherit' })
    originalCwd = process.cwd()
    process.chdir(fixtureRoot)
    server = await main(false)
  })

  afterAll(async () => {
    await server.close()
    process.chdir(originalCwd)
  })

  afterAll(async () => {
    await server.close()
  })

  it('should render index page with SSR content', async () => {
    const response = await server.inject({ method: 'GET', url: '/' })
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toBe('text/html')
    expect(response.body).toContain('Welcome to @fastify/vue!')
  })

  it('should render getMeta title in the <head>', async () => {
    const response = await server.inject({ method: 'GET', url: '/' })
    expect(response.body).toContain('<title>')
    expect(response.body).toContain('Welcome to @fastify/vue!')
    expect(response.body).toContain('</title>')
  })

  it('should include hydration script in SSR pages', async () => {
    const response = await server.inject({ method: 'GET', url: '/' })
    expect(response.body).toContain('window.route')
    expect(response.body).toContain('window.routes')
  })

  it('should render page with getData', async () => {
    const response = await server.inject({ method: 'GET', url: '/using-data' })
    expect(response.statusCode).toBe(200)
    expect(response.body).toContain('Todo List')
    expect(response.body).toContain('Do laundry')
    expect(response.body).toContain('Respond to emails')
    expect(response.body).toContain('Write report')
  })

  it('should serve getData as JSON endpoint', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/-/data/using-data',
    })
    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.todoList).toEqual(['Do laundry', 'Respond to emails', 'Write report'])
  })

  it('should render getMeta title for using-data page', async () => {
    const response = await server.inject({ method: 'GET', url: '/using-data' })
    expect(response.body).toContain('<title>')
    expect(response.body).toContain('Todo List')
    expect(response.body).toContain('</title>')
  })

  it('should render clientOnly page without SSR content', async () => {
    const response = await server.inject({ method: 'GET', url: '/client-only' })
    expect(response.statusCode).toBe(200)
    expect(response.body).not.toContain('This route is rendered on the client only!')
  })

  it('should still include hydration script for clientOnly pages', async () => {
    const response = await server.inject({ method: 'GET', url: '/client-only' })
    expect(response.body).toContain('window.route')
  })

  it('should render getMeta title for clientOnly page', async () => {
    const response = await server.inject({ method: 'GET', url: '/client-only' })
    expect(response.body).toContain('<title>')
    expect(response.body).toContain('Client Only Page')
    expect(response.body).toContain('</title>')
  })

  it('should render serverOnly page with SSR content', async () => {
    const response = await server.inject({ method: 'GET', url: '/server-only' })
    expect(response.statusCode).toBe(200)
    expect(response.body).toContain('This route is rendered on the server only!')
  })

  it('should not include mount script for serverOnly pages', async () => {
    const response = await server.inject({ method: 'GET', url: '/server-only' })
    expect(response.body).not.toContain('/$app/mount.js')
  })

  it('should not include hydration payload for serverOnly pages', async () => {
    const response = await server.inject({ method: 'GET', url: '/server-only' })
    expect(response.body).not.toContain('window.route')
  })

  it('should render dynamic route with params', async () => {
    const response = await server.inject({ method: 'GET', url: '/dynamic/42' })
    expect(response.statusCode).toBe(200)
    expect(response.body).toContain('Item ID: 42')
  })

  it('should render dynamic route with different params', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/dynamic/hello-world',
    })
    expect(response.statusCode).toBe(200)
    expect(response.body).toContain('Item ID: hello-world')
  })
})

describe('development mode', () => {
  let server
  let originalCwd

  beforeAll(async () => {
    originalCwd = process.cwd()
    process.chdir(fixtureRoot)
    server = await main(true)
  })

  afterAll(async () => {
    await server.vite.devServer.close()
    process.chdir(originalCwd)
  })

  it('should register development server', () => {
    expect(server.vite.devServer).toBeDefined()
  })

  it('should render index page', async () => {
    const response = await server.inject({ method: 'GET', url: '/' })
    expect(response.statusCode).toBe(200)
    expect(response.body).toContain('Welcome to @fastify/vue!')
  })

  it('should render using-data page', async () => {
    const response = await server.inject({ method: 'GET', url: '/using-data' })
    expect(response.statusCode).toBe(200)
    expect(response.body).toContain('Todo List')
  })
})

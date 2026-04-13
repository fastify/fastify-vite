import { resolve } from 'node:path'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import FastifyCookie from '@fastify/cookie'
import * as renderer from '@fastify/tanstack'

export async function main(dev?: boolean) {
  const server = Fastify()

  await server.register(FastifyCookie)

  // Simulate auth: parse the "user" cookie on every request
  server.addHook('onRequest', async (req) => {
    const username = req.cookies.user
    ;(req as any).user = username ? { name: username } : null
  })

  // Login endpoint sets the cookie
  server.post('/api/login', async (req, reply) => {
    const { username } = req.body as { username: string }
    reply.setCookie('user', username, { path: '/', httpOnly: true })
    return { ok: true }
  })

  // Logout endpoint clears the cookie
  server.post('/api/logout', async (req, reply) => {
    reply.clearCookie('user', { path: '/' })
    return { ok: true }
  })

  await server.register(FastifyVite, {
    root: resolve(import.meta.dirname, '..'),
    dev: dev || process.argv.includes('--dev'),
    renderer,
  })

  await server.vite.ready()
  return server
}

if (process.argv[1] === import.meta.filename) {
  const server = await main()
  await server.listen({ port: 3000 })
}

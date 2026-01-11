import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import middie from '@fastify/middie'

// Test scenario 1: Register middie BEFORE fastify-vite
export async function mainMiddieFirst(dev) {
  const server = Fastify()

  // Register middie first - fastify-vite should detect and skip its own registration
  await server.register(middie)

  await server.register(FastifyVite, {
    root: import.meta.dirname,
    dev: dev ?? process.argv.includes('--dev'),
    spa: true,
  })

  // Add custom Express middleware via server.use()
  server.use((req, res, next) => {
    req.customMiddleware = true
    next()
  })

  server.get('/', (req, reply) => {
    return reply.html()
  })

  server.get('/middleware-test', (req, reply) => {
    return { customMiddleware: req.raw.customMiddleware ?? false }
  })

  await server.vite.ready()
  return server
}

// Test scenario 2: Use server.use() after fastify-vite is registered
// This tests whether middie's decorator is available on the root server
export async function mainViteFirst(dev) {
  const server = Fastify()

  await server.register(FastifyVite, {
    root: import.meta.dirname,
    dev: dev ?? process.argv.includes('--dev'),
    spa: true,
  })

  await server.vite.ready()

  // Try to use server.use() - this should work if middie is properly exposed
  server.use((req, res, next) => {
    req.customMiddleware = true
    next()
  })

  server.get('/', (req, reply) => {
    return reply.html()
  })

  server.get('/middleware-test', (req, reply) => {
    return { customMiddleware: req.raw.customMiddleware ?? false }
  })

  return server
}

if (process.argv[1] === import.meta.filename) {
  const server = await mainMiddieFirst()
  await server.listen({ port: 3000 })
}

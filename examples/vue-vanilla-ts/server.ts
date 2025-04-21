
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import { renderToString } from 'vue/server-renderer'

export async function main (dev) {
  const server = Fastify()

  await server.register(FastifyVite, {
    // Note: this is specific to using TypeScript for the
    // Fastify server — which still requires a build step.
    // Once Node.js can natively run TypeScript files without
    // an experimental CLI flag, all this ceases to be necessary.
    //
    // Since the original server.ts sits at the top-level dir,
    // and the compiled version in dist/server.js, we need
    // to rely on process.cwd() to acurately determine the root dir
    // upon boot — or we use a CLI path flag (you can still 
    // use process.cwd() to resolve the absolute path from the flag)
    root: join(process.cwd(), 'client'),
    distDir: join(process.cwd(), 'dist'),
    dev: dev || process.argv.includes('--dev'),
    async createRenderFunction ({ createApp }) {
      return async () => ({
        element: await renderToString(createApp())
      })
    }
  })

  server.setErrorHandler((err, req, reply) => {
    console.error(err)
    reply.send(err)
  })

  await server.vite.ready()

  server.get('/', (req, reply) => {
    return reply.html()
  })

  return server
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await main()
  await server.listen({ port: 3000 })
}

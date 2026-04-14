import type { Server } from 'node:http'
import Fastify, { type FastifyPluginCallback } from 'fastify'
import { describe, expectTypeOf, it } from 'vitest'
import * as FastifyViteAll from '../src/index.ts'
import FastifyVite, { fastifyVite, type FastifyViteOptions } from '../src/index.ts'

const options = {
  root: process.cwd(),
  spa: false,
  async prepareClient({ routes: routesPromise, context: contextPromise, ...others }) {
    const context = await contextPromise
    const resolvedRoutes = await routesPromise
    return { context, routes: resolvedRoutes, ...others }
  },
  async createHtmlFunction(source) {
    return (ctx) => Promise.resolve()
  },
  createRenderFunction({ create, routes, createApp }) {
    return Promise.resolve((req) => {
      return { element: '', hydration: '' }
    })
  },
  renderer: {
    createErrorHandler(args, scope, config) {
      return (error: Error, req: any, reply: any) => {}
    },
    createRoute(args, scope, config) {},
    createRouteHandler(args, scope, config) {
      return (req, res) => {
        return Promise.resolve()
      }
    },
    prepareClient(entries, scope, config) {
      return Promise.resolve(entries.ssr ?? null)
    },
  },
} satisfies FastifyViteOptions

describe('test by options', () => {
  it('import default and named exports', () => {
    expectTypeOf<FastifyPluginCallback<FastifyViteOptions, Server>>(FastifyVite)
    expectTypeOf<FastifyPluginCallback<FastifyViteOptions, Server>>(FastifyViteAll.default)
    expectTypeOf<FastifyPluginCallback<FastifyViteOptions>>(fastifyVite)
    expectTypeOf(options.createHtmlFunction).parameter(0).toEqualTypeOf('string')
  })
})

const app = Fastify()
app.register(FastifyVite, {
  root: process.cwd(),
  dev: true,
  spa: false,
})
app.vite.ready()

// fastifyStaticOptions: accepts valid @fastify/static options
app.register(FastifyVite, {
  root: process.cwd(),
  fastifyStaticOptions: {
    preCompressed: true,
    maxAge: 31536000,
    immutable: true,
  },
})

// @ts-expect-error - root is managed internally and cannot be overridden
app.register(FastifyVite, {
  root: process.cwd(),
  fastifyStaticOptions: { root: '/bad' },
})

// @ts-expect-error - prefix is managed internally and cannot be overridden
app.register(FastifyVite, {
  root: process.cwd(),
  fastifyStaticOptions: { prefix: '/bad' },
})

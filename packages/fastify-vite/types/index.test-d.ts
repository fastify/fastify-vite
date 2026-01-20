import type { Server } from 'node:http'
import Fastify, { type FastifyPluginCallback } from 'fastify'
import { describe, expectTypeOf, it } from 'vitest'
import * as FastifyViteAll from '..'
import FastifyVite, { fastifyVite, type FastifyViteOptions } from '..'

const options = {
  root: process.cwd(),
  spa: false,
  async prepareClient({ routes: routesPromise, context: contextPromise, ...others }) {
    const context = await contextPromise
    const resolvedRoutes = await routesPromise
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { context, routes: resolvedRoutes, ...others }
  },
  createHtmlFunction(source) {
    return ({ routes, context, body }) => Promise.resolve()
  },
  createRenderFunction({ create, routes, createApp }) {
    return Promise.resolve((req) => {
      return { element: '', hydration: '' }
    })
  },
  renderer: {
    createErrorHandler(client, scope, config) {
      return (error: Error, req?: any, reply?: any) => {}
    },
    createRoute({ client }, scope, config) {},
    createRouteHandler(client, scope, config) {
      return (req, res) => {
        return Promise.resolve()
      }
    },
    prepareClient(clientModule, scope, config) {
      return Promise.resolve(clientModule)
    },
  },
} satisfies FastifyViteOptions

describe('test by options', () => {
  it('import default and named exports', () => {
    expectTypeOf<FastifyPluginCallback<FastifyViteOptions, Server>>(FastifyVite)
    expectTypeOf<FastifyPluginCallback<FastifyViteOptions, Server>>(FastifyViteAll.default)
    expectTypeOf<FastifyPluginCallback<FastifyViteOptions>>(fastifyVite)
    // eslint-disable-next-line @typescript-eslint/unbound-method
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

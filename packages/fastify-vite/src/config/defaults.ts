import type { FastifyInstance } from 'fastify'
import { createHtmlTemplateFunction } from '../html.ts'
import type {
  ClientEntries,
  CreateRouteArgs,
  ConfigOptions,
  ErrorHandler,
  HtmlFunction,
  RenderResult,
  RouteDefinition,
  RouteHandler,
  RuntimeConfig,
} from './types.ts'

export const DefaultConfig: ConfigOptions = {
  // Whether or not to enable Vite's Dev Server
  dev: process.argv.includes('--dev'),
  bundle: {
    manifest: undefined,
    indexHtml: undefined,
    dir: undefined, // deprecated
  },
  renderer: {},
  spa: false,

  virtualModulePrefix: '$app',

  prepareServer(scope, config) {},

  async prepareClient(entries: ClientEntries) {
    const clientModule = entries.ssr
    if (!clientModule) {
      return null
    }
    const routes =
      typeof clientModule.routes === 'function' ? await clientModule.routes() : clientModule.routes
    return Object.assign({}, clientModule, { routes })
  },

  createHtmlTemplateFunction,

  async createHtmlFunction(
    source: string,
    scope: FastifyInstance,
    config: RuntimeConfig,
  ): Promise<HtmlFunction> {
    const indexHtmlTemplate = await config.createHtmlTemplateFunction(source)
    if (config.spa) {
      return function () {
        this.type('text/html')
        this.send(indexHtmlTemplate({ element: '' }))
        return this
      }
    }
    if (config.hasRenderFunction) {
      return async function (ctx: RenderResult) {
        this.type('text/html')
        this.send(await indexHtmlTemplate(ctx ?? (await this.render(ctx))))
        return this
      }
    }
    return async function (ctx: RenderResult) {
      this.type('text/html')
      this.send(await indexHtmlTemplate(ctx))
      return this
    }
  },

  async createRoute(args: CreateRouteArgs, scope: FastifyInstance): Promise<void> {
    const { handler, errorHandler, route } = args
    if (route.configure) {
      await route.configure(scope)
    }
    if (!route.path) {
      return
    }
    scope.route({
      url: route.path,
      method: route.method ?? 'GET',
      handler,
      errorHandler,
      ...route,
    })
  },

  createRouteHandler(
    { client, route }: { client?: unknown; route?: RouteDefinition },
    scope: FastifyInstance,
    config: RuntimeConfig,
  ): RouteHandler {
    if (config.hasRenderFunction) {
      return async (req, reply) => {
        const page = await reply.render({
          app: scope,
          req,
          reply,
          client,
          route,
        })
        return reply.html(page)
      }
    }
    return async (req, reply) => {
      const page = await route.default({ app: scope, req, reply })
      return reply.html({
        app: scope,
        req,
        reply,
        client,
        route,
        element: page,
      })
    }
  },

  createErrorHandler(_args, _scope: FastifyInstance, config: RuntimeConfig): ErrorHandler {
    return (error, req, reply) => {
      if (config.dev) {
        console.log(error)
        reply.code(500).type('application/json').send(JSON.stringify({ error }))
      } else {
        reply.code(500).send('')
      }
    }
  },
}

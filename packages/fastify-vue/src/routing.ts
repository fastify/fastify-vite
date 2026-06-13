import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import Youch from 'youch'
import type {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteHandlerMethod,
} from 'fastify'
import type { RuntimeConfig } from '@fastify/vite'
import RouteContext from './context.ts'
import { createHtmlFunction } from './rendering.ts'
import type { ContextInit } from './types/context.ts'
import type { CreateFactory, KeyedRoute, VueRouteDefinition } from './types/route.ts'

interface ClientEntries {
  ssr: ClientModule
  [key: string]: unknown
}

interface ClientModule {
  routes: KeyedRoute[] | Promise<KeyedRoute[]>
  create: CreateFactory | Promise<{ default: CreateFactory }>
  context: ContextInit | Promise<ContextInit>
}

export async function prepareClient(
  entries: ClientEntries,
  _scope?: FastifyInstance,
  _config?: RuntimeConfig,
): Promise<ClientModule> {
  const client = entries.ssr
  if (client.context instanceof Promise) {
    client.context = await client.context
  }
  if (client.routes instanceof Promise) {
    client.routes = await client.routes
  }
  if (client.create instanceof Promise) {
    const { default: create } = await client.create
    client.create = create
  }
  return client
}

export function createErrorHandler(_: unknown, _scope: FastifyInstance, config: RuntimeConfig) {
  return async (error: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
    req.log.error(error)
    if (config.dev) {
      const youch = new Youch(error, req.raw)
      reply.code(500)
      reply.type('text/html')
      reply.send(await youch.toHTML())
      return reply
    }
    reply.code(500)
    reply.send('')
    return reply
  }
}

interface CreateRouteArgs {
  client: ClientModule & {
    routes: KeyedRoute[]
    create: CreateFactory
    context: ContextInit
  }
  errorHandler?: (error: FastifyError, req: FastifyRequest, reply: FastifyReply) => unknown
  route: VueRouteDefinition
}

export async function createRoute(
  { client, errorHandler, route }: CreateRouteArgs,
  scope: FastifyInstance,
  config: RuntimeConfig,
): Promise<void> {
  if (route.configure) {
    await route.configure(scope)
  }

  // Used when hydrating Vue Router on the client
  const routeMap = Object.fromEntries(client.routes.map((r) => [r.key, r]))

  // Extend with route context initialization module
  RouteContext.extend(client.context)

  const onRequest = async (req: FastifyRequest, reply: FastifyReply) => {
    req.route = await RouteContext.create(scope, req, reply, route, client.context)
  }

  const preHandler: Array<(req: FastifyRequest, reply: FastifyReply) => Promise<void>> = [
    async (req) => {
      const routeCtx = req.route
      if (!routeCtx.clientOnly) {
        const {
          instance: app,
          router,
          store,
        } = await client.create({
          routes: client.routes,
          routeMap,
          ctxHydration: routeCtx,
          url: req.url,
        })
        routeCtx.app = app
        routeCtx.router = router
        routeCtx.store = store
      }
    },
  ]

  if (route.getData) {
    preHandler.push(async (req) => {
      const routeCtx = req.route
      if (!routeCtx.data) {
        routeCtx.data = {}
      }
      const result = await route.getData!(routeCtx)
      Object.assign(routeCtx.data as Record<string, unknown>, result)
    })
  }

  if (route.getMeta) {
    preHandler.push(async (req) => {
      const routeCtx = req.route
      routeCtx.head = await route.getMeta!(routeCtx)
    })
  }

  if (route.onEnter) {
    preHandler.push(async (req) => {
      const routeCtx = req.route
      try {
        if (route.onEnter) {
          if (!routeCtx.data) {
            routeCtx.data = {}
          }
          const result = await route.onEnter(routeCtx)
          if (result) {
            Object.assign(routeCtx.data as Record<string, unknown>, result)
          }
        }
      } catch (err) {
        if (config.dev) {
          console.error(err)
        }
        routeCtx.error = err
      }
    })
  }

  // Route handler
  let handler: RouteHandlerMethod
  if (config.dev) {
    handler = function (_req, reply) {
      return reply.html()
    }
  } else {
    const { id } = route
    const htmlPath = id.replace('pages/', 'html/').replace(/\.vue$/, '.html')
    const distDir = config.viteConfig.build.outDir
    const htmlSource = readFileSync(join(distDir, htmlPath), 'utf8')
    const htmlFunction = await createHtmlFunction(htmlSource, scope, config)
    handler = function (_req, reply) {
      return (htmlFunction as (this: FastifyReply) => Promise<unknown>).call(reply)
    }
  }

  // Replace wildcard routes with Fastify compatible syntax
  const routePath = route.path.replace(/:\w[\w-]*\+.*/, '*')

  appendHook(route, 'onRequest', onRequest)
  appendHook(route, 'preHandler', preHandler)

  scope.route({
    url: routePath,
    method: route.method ?? ['GET', 'POST', 'PUT', 'DELETE'],
    handler,
    errorHandler,
    ...route,
  } as Parameters<typeof scope.route>[0])

  if (route.getData) {
    // If getData is provided, register JSON endpoint for it
    const dataPath = (route.dataPath ?? route.path).replace(/:\w[\w-]*\+.*/, '*')
    scope.get(`/-/data${dataPath}`, {
      onRequest,
      async handler(req, reply) {
        return reply.send(await route.getData!(req.route))
      },
    })
  }
}

function appendHook(route: Record<string, unknown>, hookName: string, hook: unknown): void {
  const incoming = Array.isArray(hook) ? hook : [hook]
  const existing = route[hookName]
    ? Array.isArray(route[hookName])
      ? (route[hookName] as unknown[])
      : [route[hookName]]
    : []
  route[hookName] = [...existing, ...incoming]
}

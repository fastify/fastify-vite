import { readFileSync } from 'node:fs'
import { join, isAbsolute } from 'node:path'
import { createHtmlFunction } from './rendering.ts'
import Youch from 'youch'
import type { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from 'fastify'
import type { RuntimeConfig, RouteDefinition, ClientEntries, ClientModule } from '@fastify/vite'

interface TanStackRoute {
  path: string
  name?: string
  configure?: (scope: FastifyInstance) => void | Promise<void>
}

interface TanStackClient extends ClientModule {
  createAppRouter:
    | ((...args: unknown[]) => unknown)
    | Promise<{ createAppRouter?: unknown; default?: unknown }>
  getRoutes?:
    | ((...args: unknown[]) => TanStackRoute[])
    | Promise<{ getRoutes?: unknown; default?: unknown }>
  routes?: TanStackRoute[]
}

export async function prepareClient(entries: ClientEntries, _: FastifyInstance) {
  const client = entries.ssr as TanStackClient | undefined
  if (!client) return null

  if (typeof client.createAppRouter !== 'function') {
    if (client.createAppRouter instanceof Promise) {
      const mod = (await client.createAppRouter) as Record<string, unknown>
      client.createAppRouter = (mod.createAppRouter ??
        mod.default) as TanStackClient['createAppRouter']
    }
  }
  if (typeof client.getRoutes !== 'function') {
    if (client.getRoutes instanceof Promise) {
      const mod = (await client.getRoutes) as Record<string, unknown>
      client.getRoutes = (mod.getRoutes ?? mod.default) as TanStackClient['getRoutes']
    }
  }

  if (typeof client.getRoutes === 'function') {
    const routes = client.getRoutes()
    // Without a catch-all, unmatched URLs hit Fastify's default 404
    // instead of TanStack Router's notFoundComponent
    const hasCatchAll = routes.some((r) => r.path === '/$' || r.path === '*' || r.path === '/*')
    if (!hasCatchAll) {
      routes.push({ path: '/*' })
    }
    return { ...client, routes }
  }

  return client
}

export function createRouteHandler() {
  return (_: FastifyRequest, reply: FastifyReply) => (reply as any).html()
}

export function createErrorHandler(_: unknown, __: FastifyInstance, config: RuntimeConfig) {
  return async (error: Error, req: FastifyRequest, reply: FastifyReply) => {
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

export async function createRoute(
  {
    handler,
    errorHandler,
    route,
  }: {
    handler?: RouteOptions['handler']
    errorHandler?: RouteOptions['errorHandler']
    route?: RouteDefinition
  },
  scope: FastifyInstance,
  config: RuntimeConfig,
) {
  if (!route?.path || !handler) return
  if (route.configure) {
    await route.configure(scope)
  }

  let routePath = route.path.replace(/\$\$/, '*').replace(/\$([a-zA-Z_]\w*)/g, ':$1')
  if (routePath !== '/') {
    routePath = routePath.replace(/\/$/, '')
  }

  let routeHandler = handler
  if (!config.dev && route.path !== '/*') {
    const htmlPath = resolveRouteHtmlPath(route, config)
    if (htmlPath) {
      const htmlSource = readFileSync(htmlPath, 'utf8')
      const htmlFunction = await createHtmlFunction(htmlSource, scope, config)
      routeHandler = (_: FastifyRequest, reply: FastifyReply) => htmlFunction.call(reply)
    }
  }

  scope.route({
    url: routePath,
    method: 'GET',
    errorHandler,
    handler: routeHandler,
  })
}

function resolveRouteHtmlPath(route: RouteDefinition, config: RuntimeConfig): string | null {
  let distDir = config.viteConfig.build.outDir
  if (!isAbsolute(distDir)) {
    distDir = join(config.viteConfig.root, distDir)
  }
  const candidates: string[] = []
  if (route.name) {
    candidates.push(join(distDir, 'html', `${String(route.name)}.html`))
  }
  const derived = (route.path ?? '').replace(/^\//, '') || 'index'
  candidates.push(join(distDir, 'html', `${derived}.html`))

  for (const candidate of candidates) {
    try {
      readFileSync(candidate, 'utf8')
      return candidate
    } catch {
      // not found, try next
    }
  }
  return null
}

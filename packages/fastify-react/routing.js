import { readFileSync } from 'node:fs'
import { join, isAbsolute } from 'node:path'
import { Youch } from 'youch'
import RouteContext from './context.js'
import { createHtmlFunction } from './rendering.js'

export async function prepareClient(entries, _) {
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
  // Attach the RSC handler from the RSC environment entry (rsc-entry.jsx)
  if (entries.rsc) {
    client.rscHandler = entries.rsc
  }
  return client
}

export function createErrorHandler(_, scope, config) {
  return async (error, req, reply) => {
    req.log.error(error)
    if (config.dev) {
      const youch = new Youch()
      reply.code(500)
      reply.type('text/html')
      reply.send(await youch.toHTML(error))
      return reply
    }
    reply.code(500)
    reply.send('')
    return reply
  }
}

export async function createRoute({ client, errorHandler, route }, scope, config) {
  if (route.configure) {
    await route.configure(scope)
  }

  // Used when hydrating Vue Router on the client
  const routeMap = Object.fromEntries(client.routes.map((_) => [_.path, _]))

  // Extend with route context initialization module
  RouteContext.extend(client.context)

  const onRequest = async (req, reply) => {
    req.route = await RouteContext.create(scope, req, reply, route, client.context)
  }

  const preHandler = [
    async (req) => {
      // RSC routes use client.rscHandler.fetch() which manages its own
      // rendering via matchRSCServerRequest and the SSR entry. Creating
      // a React app with StaticRouter here would conflict with the
      // SSR entry's RSCStaticRouter — skip it entirely.
      if (route.rsc) return
      if (!req.route.clientOnly) {
        const app = client.create({
          routes: client.routes,
          routeMap,
          ctxHydration: req.route,
          url: req.url,
        })
        req.route.app = app
      }
    },
  ]

  if (route.getData) {
    preHandler.push(async (req) => {
      if (!req.route.data) {
        req.route.data = {}
      }
      const result = await route.getData(req.route)
      Object.assign(req.route.data, result)
    })
  }

  if (route.getMeta) {
    preHandler.push(async (req) => {
      req.route.head = await route.getMeta(req.route)
    })
  }

  if (route.onEnter) {
    preHandler.push(async (req) => {
      try {
        if (route.onEnter) {
          if (!req.route.data) {
            req.route.data = {}
          }
          const result = await route.onEnter(req.route)
          Object.assign(req.route.data, result)
        }
      } catch (err) {
        if (config.dev) {
          console.error(err)
        }
        req.route.error = err
      }
    })
  }

  // Route handler — branch on rsc
  let handler
  if (route.rsc) {
    handler = async (req, reply) => {
      const { convertRequest, sendResponse } = await import('./rsc-handler.js')
      const request = await convertRequest(req)
      const response = await client.rscHandler.fetch(request)
      sendResponse(reply, response)
      // CRITICAL: return reply so Fastify's async-handler promise wrapper
      // doesn't treat the handler as resolved-with-undefined and race the
      // stream with a second reply.send(undefined). Without this, the
      // streaming ReadableStream body gets killed mid-flight and the
      // client receives content-length: 0 with an empty body.
      // See fastify/fastify#4029, #4018, #6682.
      return reply
    }
  } else if (config.dev) {
    handler = (_, reply) => reply.html()
  } else {
    const { id } = route
    const htmlPath = id.replace('pages/', 'html/').replace(/\.(j|t)sx$/, '.html')
    // Use config.viteConfig (the serialized Vite config) for outDir.
    // Resolve relative outDir against the absolute config.root (the fixture/
    // project root), not config.vite.root — the serialized root is relative
    // and joining two relative paths produces a doubled path in production.
    const viteConfig = config.viteConfig ?? config.vite
    let distDir = viteConfig.build.outDir
    if (!isAbsolute(distDir)) {
      distDir = join(config.root, distDir)
    }
    const htmlSource = readFileSync(join(distDir, htmlPath), 'utf8')
    const htmlFunction = await createHtmlFunction(htmlSource, scope, config)
    handler = (_, reply) => htmlFunction.call(reply)
  }

  // Replace wildcard routes with Fastify compatible syntax
  const routePath = route.path.replace(/:\w[\w-]*\+/, '*')

  unshiftHook(route, 'onRequest', onRequest)
  unshiftHook(route, 'preHandler', preHandler)

  scope.route({
    url: routePath,
    method: route.method ?? ['GET', 'POST', 'PUT', 'DELETE'],
    errorHandler,
    handler,
    ...route,
  })

  // Register companion route for RSC _.rsc suffix requests.
  // Client-side code (mount.js, rsc-content.jsx) constructs action/fetch
  // URLs as `${pathname}_.rsc`, e.g., `/actions_.rsc`.
  // Without this companion route, Fastify returns 404 for these requests.
  if (route.rsc) {
    scope.route({
      url: routePath + '_.rsc',
      method: ['GET', 'POST'],
      errorHandler,
      handler,
      onRequest: route.onRequest,
      preHandler: route.preHandler,
    })
  }

  if (route.getData) {
    // If getData is provided, register JSON endpoint for it
    scope.get(`/-/data${routePath}`, {
      onRequest,
      async handler(req, reply) {
        return reply.send(await route.getData(req.route))
      },
    })
  }
}

function unshiftHook(route, hookName, hook) {
  if (!route[hookName]) {
    route[hookName] = []
  }
  if (!Array.isArray(hook)) {
    hook = [hook]
  }
  if (!Array.isArray(route[hookName])) {
    route[hookName] = [route[hookName]]
  }
  route[hookName] = [...route[hookName], ...hook]
}

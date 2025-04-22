import { readFileSync } from 'node:fs'
import { join, isAbsolute } from 'node:path'
import Youch from 'youch'
import RouteContext from './context.js'
import { createHtmlFunction } from './rendering.js'

export async function prepareClient (entries, _) {
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

export function createErrorHandler (_, scope, config) {
  return async (error, req, reply) => {
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

export async function createRoute ({ client, errorHandler, route }, scope, config) {
  if (route.configure) {
    await route.configure(scope)
  }

  // Used when hydrating Vue Router on the client
  const routeMap = Object.fromEntries(client.routes.map(_ => [_.path, _]))

  // Extend with route context initialization module
  RouteContext.extend(client.context)

  const onRequest = async (req, reply) => {
    req.route = await RouteContext.create(
      scope,
      req,
      reply,
      route,
      client.context,
    )
  }

  const preHandler = [
    async (req) => {
      if (!req.route.clientOnly) {
        const app = client.create({
          routes: client.routes,
          routeMap,
          ctxHydration: req.route,
          url: req.url,
        })
        req.route.app = app
      }
    }
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

  // Route handler
  let handler
  if (config.dev) {
    handler = (_, reply) => reply.html()
  } else {
    const { id } = route
    const htmlPath = id.replace(/pages\/(.*?)\.(j|t)sx/, 'html/$1.html')
    let distDir = config.vite.build.outDir
    if (!isAbsolute(config.vite.build.outDir)) {
      distDir = join(config.vite.root, distDir)
    }
    const htmlSource = readFileSync(join(distDir, htmlPath), 'utf8')
    const htmlFunction = await createHtmlFunction(htmlSource, scope, config)
    handler = (_, reply) => htmlFunction.call(reply)
  }

  // Replace wildcard routes with Fastify compatible syntax
  const routePath = route.path.replace(/:[^+]+\+/, '*')
  
  unshiftHook(route, 'onRequest', onRequest)
  unshiftHook(route, 'preHandler', preHandler)

  scope.route({
    url: routePath,
    method: route.method ?? ['GET', 'POST', 'PUT', 'DELETE'],
    errorHandler,
    handler,
    ...route,
  })

  if (route.getData) {
    // If getData is provided, register JSON endpoint for it
    scope.get(`/-/data${routePath}`, {
      onRequest,
      async handler (req, reply) {
        reply.send(await route.getData(req.route))
      },
    })
  }
}

function unshiftHook (route, hookName, hook) {
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

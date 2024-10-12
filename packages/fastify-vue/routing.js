import RouteContext from './context.js'
import Youch from 'youch'

export async function prepareClient (client) {
  client.context = await client.context
  client.routes = await client.routes
  return client
}

export function createErrorHandler (_, scope, config) {
  return async (error, req, reply) => {
    req.log.error(error)
    if (config.dev) {
      const youch = new Youch(error, req)
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

  const preHandler = []

  if (route.getData) {
    preHandler.push(async (req) => {
      req.route.data = await route.getData(req.route)
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

  scope.route({
    url: route.path,
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    errorHandler,
    onRequest,
    preHandler,
    handler (_, reply) {
      return reply.html()
    },
    ...route,
  })

  if (route.getData) {
    // If getData is provided, register JSON endpoint for it
    scope.get(`/-/data${route.path}`, {
      onRequest,
      async handler (req, reply) {
        reply.send(await route.getData(req.route))
      },
    })
  }
}

// Otherwise we get a ReferenceError, but since
// this function is only ran once, there's no overhead
class Routes extends Array {
  toJSON () {
    return this.map((route) => {
      return {
        id: route.id,
        path: route.path,
        name: route.name,
        layout: route.layout,
        getData: !!route.getData,
        getMeta: !!route.getMeta,
        onEnter: !!route.onEnter,
      }
    })
  }
}

export function prepareServer(server) {
  let url
  server.decorate('serverURL', { getter: () => url })
  server.addHook('onListen', () => {
    const { port, address, family } = server.server.address()
    const protocol = server.https ? 'https' : 'http'
    if (family === 'IPv6') {
      url = `${protocol}://[${address}]:${port}`
    } else {
      url = `${protocol}://${address}:${port}`
    }
  })
  server.decorateRequest('fetchMap', null)
  server.addHook('onRequest', (req, _, done) => {
    req.fetchMap = new Map()
    done()
  })
  server.addHook('onResponse', (req, _, done) => {
    req.fetchMap = undefined
    done()
  })
}

export async function createRoutes (fromPromise, { param } = { param: /\[([\.\w]+\+?)\]/ }) {
  const { default: from } = await fromPromise
  const importPaths = Object.keys(from)
  const promises = []
  if (Array.isArray(from)) {
    for (const routeDef of from) {
      promises.push(
        getRouteModule(routeDef.path, routeDef.component)
          .then((routeModule) => {
            return {
              id: routeDef.path,
              name: routeDef.path ?? routeModule.path,
              path: routeDef.path ?? routeModule.path,
              ...routeModule,
            }
          }),
      )
    }
  } else {
    // Ensure that static routes have precedence over the dynamic ones
    for (const path of importPaths.sort((a, b) => a > b ? -1 : 1)) {
      promises.push(
        getRouteModule(path, from[path])
          .then((routeModule) => {
            const route = {
              id: path,
              layout: routeModule.layout,
              name: path
                // Remove /pages and .vue extension
                .slice(6, -4)
                // Remove params
                .replace(param, '')
                // Remove leading and trailing slashes
                .replace(/^\/*|\/*$/g, '')
                // Replace slashes with underscores
                .replace(/\//g, '_'),
              path:
                routeModule.path ??
                path
                  // Remove /pages and .vue extension
                  .slice(6, -4)
                  // Replace [id] with :id and [slug+] with :slug+
                  .replace(param, (_, m) => `:${m}`)
                  .replace(/:\w+\+/, (_, m) => `*`)
                  // Replace '/index' with '/'
                  .replace(/\/index$/, '/')
                  // Remove trailing slashs
                  .replace(/(.+)\/+$/, (...m) => m[1]),
              ...routeModule,
            }

            if (route.name === '') {
              route.name = 'catch-all'
            }

            return route
          }),
      )
    }
  }
  return new Routes(...await Promise.all(promises))
}


function getRouteModuleExports (routeModule) {
  return {
    // The Route component (default export)
    component: routeModule.default,
    // The Layout Route component
    layout: routeModule.layout,
    // Route-level hooks
    getData: routeModule.getData,
    getMeta: routeModule.getMeta,
    onEnter: routeModule.onEnter,
    // Other Route-level settings
    streaming: routeModule.streaming,
    clientOnly: routeModule.clientOnly,
    serverOnly: routeModule.serverOnly,
    // Server configure function
    configure: routeModule.configure,
    // Route-level Fastify hooks
    onRequest: routeModule.onRequest ?? undefined,
    preParsing: routeModule.preParsing ?? undefined,
    preValidation: routeModule.preValidation ?? undefined,
    preHandler: routeModule.preHandler ?? undefined,
    preSerialization: routeModule.preSerialization ?? undefined,
    onError: routeModule.onError ?? undefined,
    onSend: routeModule.onSend ?? undefined,
    onResponse: routeModule.onResponse ?? undefined,
    onTimeout: routeModule.onTimeout ?? undefined,
    onRequestAbort: routeModule.onRequestAbort ?? undefined,
  }
}

async function getRouteModule (path, routeModuleInput) {
  if (typeof routeModuleInput === 'function') {
    const routeModule = await routeModuleInput()
    return getRouteModuleExports(routeModule)
  }
  return getRouteModuleExports(routeModuleInput)
}

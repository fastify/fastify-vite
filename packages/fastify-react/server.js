// Otherwise we get a ReferenceError, but since
// this function is only ran once, there's no overhead
class Routes extends Array {
  * toJSON () {
    for (const route of this) {
      const json = {}
      if (route.id) {
        json.id = route.id
      }
      if (route.path) {
        json.path = route.path
      }
      if (route.name) {
        json.name = route.name
      }
      if (route.layout) {
        json.layout = route.layout
      }
      if (route.getData) {
        json.getData = true
      }
      if (route.getMeta) {
        json.getMeta = true
      }
      if (route.onEnter) {
        json.onEnter = true
      }
      yield json
    }
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
  // server.addHook('onRequest', (req, _, done) => {
  //   done()
  // })
  // server.addHook('onResponse', (req, _, done) => {
  //   req.fetchMap = undefined
  //   done()
  // })
}

export async function createRoutes (fromPromise, { param } = { param: /\[([\.\w]+\+?)\]/ }) {
  const { default: from } = await fromPromise
  const importPaths = Object.keys(from)
  const promises = []
  if (Array.isArray(from)) {
    for (const routeDef of from) {
      promises.push(
        getRouteModule(routeDef.path, routeDef.element)
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
  const modExports = Object.create(null)
  // The Route component (default export)
  modExports.element = routeModule.default
  // The Layout Route component
  if (routeModule.layout) {
    modExports.layout = routeModule.layout
  }
  // Route-level hooks
  if (routeModule.getData) {
    modExports.getData = routeModule.getData
  }
  if (routeModule.getMeta) {
    modExports.getMeta = routeModule.getMeta
  }
  if (routeModule.onEnter) {
    modExports.onEnter = routeModule.onEnter
  }
  // Other Route-level settings
  if (routeModule.streaming) {
    modExports.streaming = routeModule.streaming
  }
  if (routeModule.clientOnly) {
    modExports.clientOnly = routeModule.clientOnly
  }
  if (routeModule.serverOnly) {
    modExports.serverOnly = routeModule.serverOnly
  }
  return modExports
}

async function getRouteModule (path, routeModuleInput) {
  if (typeof routeModuleInput === 'function') {
    const routeModule = await routeModuleInput()
    return getRouteModuleExports(routeModule)
  }
  return getRouteModuleExports(routeModuleInput)
}

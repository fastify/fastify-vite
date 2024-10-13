// Otherwise we get a ReferenceError, but since
// this function is only ran once, there's no overhead
class Routes extends Array {
  toJSON () {
    return this.map((route) => {
      return {
        id: route.id,
        path: route.path,
        layout: route.layout,
        getData: !!route.getData,
        getMeta: !!route.getMeta,
        onEnter: !!route.onEnter,
      }
    })
  }
}

export async function createRoutes (fromPromise, { param } = { param: /\[(\w+)\]/ }) {
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
            return {
              id: path,
              layout: routeModule.layout,
              path: routeModule.path ?? path
                // Remove /pages and .jsx extension
                .slice(6, -4)
                // Replace [id] with :id
                .replace(param, (_, m) => `:${m}`)
                // Replace '/index' with '/'
                .replace(/\/index$/, '/')
                // Remove trailing slashs
                .replace(/(.+)\/+$/, (...m) => m[1]),
              ...routeModule,
            }
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
  }
}

async function getRouteModule (path, routeModuleInput) {
  // const isServer = typeof process !== 'undefined'
  if (typeof routeModuleInput === 'function') {
    const routeModule = await routeModuleInput()
    return getRouteModuleExports(routeModule)
  }
  return getRouteModuleExports(routeModuleInput)
}

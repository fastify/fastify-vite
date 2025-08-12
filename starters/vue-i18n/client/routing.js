import i18nConfig from '/i18n.config.js'

// Otherwise we get a ReferenceError, but since
// this function is only ran once, there's no overhead
class Routes extends Array {
  toJSON () {
    return this.map((route) => {
      return {
        id: route.id,
        path: route.path,
        dataPath: route.dataPath,
        name: route.name,
        key: route.key,
        meta: route.meta,
        layout: route.layout,
        getData: !!route.getData,
        getMeta: !!route.getMeta,
        onEnter: !!route.onEnter,
      }
    })
  }
}

export async function createRoutes (fromPromise) {
  const { locales, localeDomains, localePrefix } = i18nConfig
  const { default: from } = await fromPromise
  const importPaths = Object.keys(from)
  const promises = []
  const i18n = Object.keys(localeDomains).length > 0 || localePrefix
  const defaultLocale = Array.isArray(locales) && locales.length > 0 ? locales[0] : 'en'

  if (Array.isArray(from)) {
    for (const routeDef of from) {
      promises.push(
        await getRouteModule(routeDef.path, routeDef.component).then((routeModule) => {
          return {
            id: routeDef.path,
            name: routeDef.path ?? routeModule.path,
            path: routeDef.path ?? routeModule.path,
            key: `*__${routeDef.path ?? routeModule.path}`,
            meta: {
              localePrefix,
              locale: defaultLocale,
            },
            ...routeModule,
          }
        }),
      )
    }
  } else {
    // Ensure that static routes have precedence over the dynamic ones
    for (const path of importPaths.sort((a, b) => a > b ? -1 : 1)) {
      const rts = await getRouteModule(path, from[path]).then((routeModule) => {
        const ret = []

        const baseRoute = {
          id: path,
          layout: routeModule.layout,
          name: path
            // Remove /pages and .jsx extension
            .slice(6, -4)
            // Remove params
            .replace(/\[([.\w]+\+?)\]/, (_, m) => '')
            // Remove leading and trailing slashes
            .replace(/^\/*|\/*$/g, '')
            // Replace slashes with underscores
            .replace(/\//g, '_'),
          path:
            routeModule.path ??
            path
              // Remove /pages and .jsx extension
              .slice(6, -4)
              // Replace [id] with :id and [slug+] with :slug+
              .replace(/\[([.\w]+\+?)\]/, (_, m) => `:${m}`)
              // Replace '/index' with '/'
              .replace(/\/index$/, '/')
              // Remove trailing slashes
              .replace(/(.+)\/+$/, (...m) => m[1]),
          ...routeModule,
        }

        if (baseRoute.name === '') {
          baseRoute.name = 'catch-all'
        }

        baseRoute.key = `*__${baseRoute.path}`
        baseRoute.dataPath = baseRoute.path
        baseRoute.meta = {
          localePrefix,
          locale: defaultLocale,
        }

        if (i18n) {
          // Add the customized locale routes
          for (const locale of locales) {
            const localeRoute = Object.assign({}, baseRoute)
            localeRoute.name = `${locale}__${localeRoute.name}`
            localeRoute.meta = {
              localePrefix,
              locale,
            }

            // If the route has a custom i18n path, use it, otherwise use standard path
            const localePath = routeModule.i18n ? routeModule.i18n[locale] : null
            if (localePath) {
              localeRoute.path = localePath
            }

            // Add the find-my-way locale domain constraint
            if (localeDomains[locale]) {
              localeRoute.constraints = { host: localeDomains[locale] }
              localeRoute.domain = localeDomains[locale]
              localeRoute.key = `${localeRoute.domain }__${localeRoute.path}`

              // Prepend the locale to the dataPath to avoid conflicts
              // with other domains
              localeRoute.dataPath = `/${locale}${localeRoute.path}`
            } else if (localePrefix) {
              if (localeRoute.path === '/') {
                localeRoute.path = locale === defaultLocale ? '/' : `/${locale}`
                localeRoute.dataPath = `/${locale}`
              } else {
                localeRoute.path = `/${locale}${localeRoute.path}`
                localeRoute.dataPath = localeRoute.path
              }

              localeRoute.key = `*__${localeRoute.path}`
            }

            ret.push(localeRoute)
          }
        } else {
          // Add the default locale route
          const baseLocaleRoute = Object.assign({}, baseRoute)
          ret.push(baseLocaleRoute)
        }

        return ret
      })

      promises.push(...rts)
    }
  }

  return new Routes(...promises)
}

export async function hydrateRoutes (fromInput) {
  let from = fromInput
  if (Array.isArray(from)) {
    from = Object.fromEntries(
      from.map((route) => [route.path, route]),
    )
  }
  return window.routes.map((route) => {
    route.loader = memoImport(from[route.id])
    route.component = () => route.loader()
    return route
  })
}

function memoImport (func) {
  // Otherwise we get a ReferenceError, but since this function
  // is only ran once for each route, there's no overhead
  const kFuncExecuted = Symbol('kFuncExecuted')
  const kFuncValue = Symbol('kFuncValue')
  func[kFuncExecuted] = false
  return async () => {
    if (!func[kFuncExecuted]) {
      func[kFuncValue] = await func()
      func[kFuncExecuted] = true
    }
    return func[kFuncValue]
  }
}

async function jsonDataFetch (path, localePrefix, locale) {
  const dataPath = localePrefix ? path : `/${locale+path}`
  const response = await fetch(`/-/data${dataPath}`)
  let data
  let error
  try {
    data = await response.json()
  } catch (err) {
    error = err
  }
  if (data?.statusCode === 500) {
    throw new Error(data.message)
  }
  if (error) {
    throw error
  }
  return data
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
    i18n: routeModule.i18n,
    streaming: routeModule.streaming,
    clientOnly: routeModule.clientOnly,
    serverOnly: routeModule.serverOnly,
    // Server configure function
    configure: routeModule.configure,
    // // Route-level Fastify hooks
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

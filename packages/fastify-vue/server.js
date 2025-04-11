// Otherwise we get a ReferenceError, but since
// this function is only ran once, there's no overhead
class Routes extends Array {
  toJSON () {
    return this.map((route) => {
      return {
        id: route.id,
        path: route.path,
        name: route.name,
        locale: route.locale,
        layout: route.layout,
        domain: route.domain || '*',
        getData: !!route.getData,
        getMeta: !!route.getMeta,
        onEnter: !!route.onEnter,
      }
    })
  }
}

export async function createRoutes (fromPromise, { localeDomains, localePrefix, locales }) {
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
            locale: defaultLocale,
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

        // Add the default locale route
        const baseLocaleRoute = Object.assign({}, baseRoute)
        baseLocaleRoute.locale = defaultLocale
        baseLocaleRoute.meta = { locale: defaultLocale }

        if (i18n) {
          // Add the customized locale routes
          for (const locale of locales) {
            const localeRoute = Object.assign({}, baseRoute)
            localeRoute.name = `${locale}__${localeRoute.name}`
            localeRoute.locale = locale
            localeRoute.meta = { locale }

            // If the route has a custom i18n path, use it, otherwise use standard path
            const localePath = routeModule.i18n ? routeModule.i18n[locale] : null
            if (localePath) {
              localeRoute.path = localePath
            }

            // Add the find-my-way locale domain constraint
            if (localeDomains[locale]) {
              localeRoute.constraints = { host: localeDomains[locale] }
              localeRoute.domain = localeDomains[locale]
            } else if (localePrefix) {
              if (localeRoute.path === '/') {
                localeRoute.path = locale === defaultLocale ? '/' : `/${locale}`
              } else {
                localeRoute.path = `/${locale}${localeRoute.path}`
              }
            }

            ret.push(localeRoute)
          }
        } else {
          ret.push(baseLocaleRoute)
        }

        return ret
      })

      promises.push(...rts)
    }
  }

  return new Routes(...promises)
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

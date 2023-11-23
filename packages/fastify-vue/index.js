// Used to send a readable stream to reply.send()
import { Readable } from 'stream'

// fastify-vite's minimal HTML templating function,
// which extracts interpolation variables from comments
// and returns a function with the generated code
import { createHtmlTemplateFunction } from '@fastify/vite/utils'

// Vue 3's SSR functions
import { renderToString, renderToNodeStream } from 'vue/server-renderer'

// Used to safely serialize JavaScript into
// <script> tags, preventing a few types of attack
import * as devalue from 'devalue'

// Small SSR-ready library used to generate
// <title>, <meta> and <link> elements
import Head from 'unihead'

// Helpers from the Node.js stream library to
// make it easier to work with renderToPipeableStream()
import { generateHtmlStream } from './server/stream.js'

// Holds the universal route context
import RouteContext from './server/context.js'

export default {
  prepareClient,
  createHtmlFunction,
  createRenderFunction,
  createRouteHandler,
  createRoute,
}

export async function prepareClient ({
  routes: routesPromise,
  context: contextPromise,
  ...others
}) {
  const context = await contextPromise
  const resolvedRoutes = await routesPromise
  return { context, routes: resolvedRoutes, ...others }
}

// The return value of this function gets registered as reply.html()
export function createHtmlFunction (source, scope, config) {
  // Templating functions for universal rendering (SSR+CSR)
  const [unHeadSource, unFooterSource] = source.split('<!-- element -->')
  const unHeadTemplate = createHtmlTemplateFunction(unHeadSource)
  const unFooterTemplate = createHtmlTemplateFunction(unFooterSource)
  // Templating functions for server-only rendering (SSR only)
  const [soHeadSource, soFooterSource] = source
    // Unsafe if dealing with user-input, but safe here
    // where we control the index.html source
    .replace(/<script[^>]+type="module"[^>]+>.*?<\/script>/g, '')
    .split('<!-- element -->')
  const soHeadTemplate = createHtmlTemplateFunction(soHeadSource)
  const soFooterTemplate = createHtmlTemplateFunction(soFooterSource)
  // This function gets registered as reply.html()
  return function ({ routes, context, body, stream }) {
    // Initialize hydration, which can stay empty if context.serverOnly is true
    let hydration = ''
    // Decide which templating functions to use, with and without hydration
    const headTemplate = context.serverOnly ? soHeadTemplate : unHeadTemplate
    const footerTemplate = context.serverOnly ? soFooterTemplate : unFooterTemplate
    // Render page-level <head> elements
    const head = new Head(context.head).render()
    // Create readable stream with prepended and appended chunks
    const readable = Readable.from(generateHtmlStream({
      body,
      stream,
      head: headTemplate({ ...context, head, hydration }),
      // TODO refactor generateHtmlStream to
      // fix inner arrow function allocation
      footer: () => footerTemplate({
        ...context,
        hydration: '',
        // Decide whether or not to include the hydration script
        ...!context.serverOnly && {
          hydration: (
            '<script>\n' +
            `window.route = ${devalue.uneval(context.toJSON())}\n` +
            `window.routes = ${devalue.uneval(routes.toJSON())}\n` +
            '</script>'
          )
        }
      }),
    }))
    // Send out header and readable stream with full response
    this.type('text/html')
    this.send(readable)
  }
}

export async function createRenderFunction ({ routes, create }) {
  // Create convenience-access routeMap
  const routeMap = Object.fromEntries(routes.toJSON().map((route) => {
    return [route.path, route]
  }))
  // create is exported by client/index.js
  return async function (req) {
    let stream = null
    let body = null
    // Creates main Vue component with all the SSR context it needs
    if (!req.route.clientOnly) {
      const app = await create({
        routes,
        routeMap,
        ctxHydration: req.route,
        url: req.url,
      })
      if (req.route.streaming) {
        stream = renderToNodeStream(app.instance, app.ctx)
      } else {
        body = renderToString(app.instance, app.ctx)
      }
    }
    // Perform SSR, i.e., turn app.instance into an HTML fragment
    // The SSR context data is passed along so it can be inlined for hydration
    return { routes, context: req.route, body, stream }
  }
}

export function createRouteHandler (client, scope, config) {
  return async function (req, reply) {
    reply.html(await reply.render(req))
    return reply
  }
}

export function createRoute ({ client, handler, errorHandler, route }, scope, config) {
  const onRequest = async function onRequest (req, reply) {
    req.route = await RouteContext.create(
      scope,
      req,
      reply,
      route,
      client.context,
    )
  }
  if (route.getData) {
    // If getData is provided, register JSON endpoint for it
    scope.get(`/-/data${route.path}`, {
      onRequest,
      async handler (req, reply) {
        reply.send(await route.getData(req.route))
      },
    })
  }

  // See https://github.com/fastify/fastify-dx/blob/main/URMA.md
  const hasURMAHooks = Boolean(
    route.getData || route.getMeta || route.onEnter,
  )

  // Extend with route context initialization module
  RouteContext.extend(client.context)

  scope.get(route.path, {
    onRequest,
    // If either getData or onEnter are provided,
    // make sure they run before the SSR route handler
    ...hasURMAHooks && {
      async preHandler (req, reply) {
        try {
          if (route.getData) {
            req.route.data = await route.getData(req.route)
          }
          if (route.getMeta) {
            req.route.head = await route.getMeta(req.route)
          }
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
      },
    },
    handler,
    errorHandler,
    ...route,
  })
}

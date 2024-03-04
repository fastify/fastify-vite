// Used to send a readable stream to reply.send()
import { Readable } from 'stream'

// fastify-vite's minimal HTML templating function,
// which extracts interpolation variables from comments
// and returns a function with the generated code
import { createHtmlTemplateFunction } from '@fastify/vite/utils'

// Used to safely serialize JavaScript into
// <script> tags, preventing a few types of attack
import * as devalue from 'devalue'

// Small SSR-ready library used to generate
// <title>, <meta> and <link> elements
import Head from 'unihead'

// Used for removing <script> tags when serverOnly is enabled
import { HTMLRewriter } from 'html-rewriter-wasm'

// Helpers from the Node.js stream library to
// make it easier to work with renderToPipeableStream()
import {
  generateHtmlStream,
  onAllReady,
  onShellReady,
} from './server/stream.js'

// Holds the universal route context
import RouteContext from './server/context.js'

export default {
  prepareClient,
  prepareServer,
  createHtmlFunction,
  createRenderFunction,
  createRouteHandler,
  createRoute,
}

async function prepareClient({
  routes: routesPromise,
  context: contextPromise,
  ...others
}) {
  const context = await contextPromise
  const resolvedRoutes = await routesPromise
  return { context, routes: resolvedRoutes, ...others }
}

// The return value of this function gets registered as reply.html()
async function createHtmlFunction(source, scope, config) {
  // Templating functions for universal rendering (SSR+CSR)
  const [unHeadSource, unFooterSource] = source.split('<!-- element -->')
  const unHeadTemplate = createHtmlTemplateFunction(unHeadSource)
  const unFooterTemplate = createHtmlTemplateFunction(unFooterSource)
  // Templating functions for server-only rendering (SSR only)
  const [soHeadSource, soFooterSource] = (await removeModules(source)).split(
    '<!-- element -->',
  )
  const soHeadTemplate = createHtmlTemplateFunction(soHeadSource)
  const soFooterTemplate = createHtmlTemplateFunction(soFooterSource)
  // This function gets registered as reply.html()
  return function ({ routes, context, body }) {
    // Decide which templating functions to use, with and without hydration
    const headTemplate = context.serverOnly ? soHeadTemplate : unHeadTemplate
    const footerTemplate = context.serverOnly
      ? soFooterTemplate
      : unFooterTemplate
    // Render page-level <head> elements
    const head = new Head(context.head).render()
    // Create readable stream with prepended and appended chunks
    const readable = Readable.from(
      generateHtmlStream({
        body:
          body && (context.streaming ? onShellReady(body) : onAllReady(body)),
        head: headTemplate({ ...context, head }),
        footer: () =>
          footerTemplate({
            ...context,
            hydration: '',
            // Decide whether or not to include the hydration script
            ...(!context.serverOnly && {
              hydration: `<script>\nwindow.route = ${devalue.uneval(
                context.toJSON(),
              )}\nwindow.routes = ${devalue.uneval(
                routes.toJSON(),
              )}\n</script>`,
            }),
          }),
      }),
    )
    // Send out header and readable stream with full response
    this.type('text/html')
    this.send(readable)
  }
}

async function createRenderFunction({ routes, create }) {
  // create is exported by client/index.js
  return (req) => {
    // Create convenience-access routeMap
    const routeMap = Object.fromEntries(
      routes.toJSON().map((route) => {
        return [route.path, route]
      }),
    )
    // Creates main React component with all the SSR context it needs
    const app =
      !req.route.clientOnly &&
      create({
        routes,
        routeMap,
        ctxHydration: req.route,
        url: req.url,
      })
    // Perform SSR, i.e., turn app.instance into an HTML fragment
    // The SSR context data is passed along so it can be inlined for hydration
    return { routes, context: req.route, body: app }
  }
}

function createRouteHandler({ client }, scope, config) {
  return (req, reply) => {
    reply.html(reply.render(req))
    return reply
  }
}

function prepareServer(server) {
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

export async function createRoute(
  { client, handler, errorHandler, route },
  scope,
  config,
) {
  const onRequest = async function onRequest(req, reply) {
    req.route = await RouteContext.create(
      scope,
      req,
      reply,
      route,
      client.context,
    )
  }

  if (route.configure) {
    await route.configure(scope)
  }

  if (route.getData) {
    // If getData is provided, register JSON endpoint for it
    scope.get(`/-/data${route.path}`, {
      onRequest,
      async handler(req, reply) {
        reply.send(await route.getData(req.route))
      },
    })
  }

  // See https://github.com/fastify/fastify-dx/blob/main/URMA.md
  const hasURMAHooks = Boolean(route.getData || route.getMeta || route.onEnter)

  // Extend with route context initialization module
  RouteContext.extend(client.context)

  scope.route({
    url: route.path,
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    onRequest,
    // If either getData or onEnter are provided,
    // make sure they run before the SSR route handler
    ...(hasURMAHooks && {
      async preHandler(req, reply) {
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
    }),
    handler,
    errorHandler,
    ...route,
  })
}

async function removeModules(html) {
  const decoder = new TextDecoder()

  let output = ''
  const rewriter = new HTMLRewriter((outputChunk) => {
    output += decoder.decode(outputChunk)
  })

  rewriter.on('script', {
    element(element) {
      for (const [attr, value] of element.attributes) {
        if (attr === 'type' && value === 'module') {
          element.replace('')
        }
      }
    },
  })

  try {
    const encoder = new TextEncoder()
    await rewriter.write(encoder.encode(html))
    await rewriter.end()
    return output
  } finally {
    rewriter.free()
  }
}

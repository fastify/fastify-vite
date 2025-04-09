import { PassThrough, Readable } from 'node:stream'
// import { createRequire } from 'node:module'
// Helper to make the stream returned renderToPipeableStream()
// behave like an event emitter and facilitate error handling in Fastify
// import { Minipass } from 'minipass'
// React 18's preferred server-side rendering function,
// which enables the combination of React.lazy() and Suspense
import { renderToString } from 'react-dom/server'
import * as devalue from 'devalue'
import Head from 'unihead'
import { createHtmlTemplates } from './templating.js'

// const require = createRequire(import.meta.url)
// const { renderToReadableStream } = require('react-dom/server')

// Helper function to get an AsyncIterable (via PassThrough)
// from the renderToPipeableStream() onShellReady event
export function onShellReady(app) {
  const pt = new PassThrough()
  return new Promise((resolve) => {
    try {
      const pipeable = renderToPipeableStream(app, {
        onShellReady() {
          resolve(pipeable.pipe(pt))
        },
      })
    } catch (error) {
      resolve(error)
    }
  })
}

// Helper function to get an AsyncIterable (via Minipass)
// from the renderToPipeableStream() onAllReady event
// export function onAllReady(app) {
//   const pt = new PassThrough()
//   return new Promise((resolve) => {
//     try {
//       const pipeable = renderToPipeableStream(app, {
//         onAllReady() {
//           resolve(pipeable.pipe(pt))
//         },
//       })
//     } catch (error) {
//       resolve(error)
//     }
//   })
// }

export async function onAllReady(app) {
  try {
  return Readable.fromWeb(await renderToReadableStream(app))
  } catch (err) {
    console.error(err)
  }
}

// export function onAllReady(app) {
//   const pt = new PassThrough()
//   return new Promise((resolve) => {
//     try {
//       const pipeable = renderToPipeableStream(app, {
//         onAllReady() {
//           resolve(pipeable.pipe(pt))
//         },
//       })
//     } catch (error) {
//       resolve(error)
//     }
//   })
// }

export async function createRenderFunction ({ routes, create }) {
  // Used when hydrating React Router on the client
  const routeMap = Object.fromEntries(routes.map(_ => [_.path, _]))
  // Registered as reply.render()
  return function () {
    if (this.request.route.streaming) {
      return createStreamingResponse(this.request, routes, routeMap, create)
    }
    return createResponse(this.request, routes, routeMap, create)
  }
}

async function createStreamingResponse (req, routes) {
  // SSR stream
  const body = await onShellReady(req.route.app)
  return { routes, context: req.route, body }
}

async function createResponse (req, routes) {
  if (!req.route.clientOnly) {
    // SSR string
    req.route.element = renderToString(req.route.app)
  }
  return { routes, context: req.route }
}

// The return value of this function gets registered as reply.html()
export async function createHtmlFunction (source, _, config) {
  // Creates `universal` and `serverOnly` sets of
  // HTML `beforeElement` and `afterElement` templates
  const templates = await createHtmlTemplates(source, config)

  // Registered as reply.html()
  return async function () {
    const { routes, context } = await this.render()

    this.type('text/html')

    // Use template with client module import removed
    if (context.serverOnly) {
      // Turn off hydration
      context.hydration = ''

      return streamShell(
        templates.serverOnly,
        context,
      )
    }

    // Embed full hydration script
    // context.hydration = (
    //   `<script>\nwindow.route = ${
    //     // Server data payload
    //     devalue.uneval(context.toJSON())
    //   }\nwindow.routes = ${
    //     // Universal router payload
    //     devalue.uneval(Array.from(routes.toJSON()))
    //   }\n</script>`
    // )

    // In all other cases use universal,
    // template which works the same for SSR and CSR.

    if (context.clientOnly) {
      return sendClientOnlyShell(templates.universal, context)
    }

    return streamShell(this, templates.universal, context)
  }
}

export function sendClientOnlyShell (templates, context, body) {
  context.head = new Head(context.head).render()
  return `${
    templates.beforeElement(context)
  }${
    templates.afterElement(context)
  }`
}

// export function streamShell(templates, context, body) {
//   context.head = new Head(context.head).render()
  
//   const stream = new PassThrough()
  
//   stream.write(templates.beforeElement(context))
  
//   body.on('data', (chunk) => {
//     stream.write(chunk)
//   })
  
//   body.on('end', () => {
//     stream.write(templates.afterElement(context))
//     stream.end()
//   })
  
//   body.on('error', (err) => stream.destroy(err))
  
//   return stream
// }

export function streamShell (reply, template, context) {
  context.head = new Head(context.head).render()
  reply.raw.write(template(context))
  reply.raw.end()
  return reply
}

// async function * createShellStream (templates, context, body) {
//   yield 
//   yield 
//   yield 
// }

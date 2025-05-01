import { Readable } from 'node:stream'
// Helper to make the stream returned renderToPipeableStream()
// behave like an event emitter and facilitate error handling in Fastify
import { Minipass } from 'minipass'
// React 18's preferred server-side rendering function,
// which enables the combination of React.lazy() and Suspense
import { renderToPipeableStream } from 'react-dom/server'
import * as devalue from 'devalue'
import { transformHtmlTemplate } from '@unhead/react/server'
import { createHtmlTemplates } from './templating.js'

// Helper function to get an AsyncIterable (via PassThrough)
// from the renderToPipeableStream() onShellReady event
export function onShellReady(app) {
  const duplex = new Minipass()
  return new Promise((resolve, reject) => {
    try {
      const pipeable = renderToPipeableStream(app, {
        onShellReady() {
          resolve(pipeable.pipe(duplex))
        },
      })
    } catch (error) {
      resolve(error)
    }
  })
}

// Helper function to get an AsyncIterable (via Minipass)
// from the renderToPipeableStream() onAllReady event
export function onAllReady(app) {
  const duplex = new Minipass()
  return new Promise((resolve, reject) => {
    try {
      const pipeable = renderToPipeableStream(app, {
        onAllReady() {
          resolve(pipeable.pipe(duplex))
        },
      })
    } catch (error) {
      resolve(error)
    }
  })
}

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
  let body
  if (!req.route.clientOnly) {
    // SSR string
    body = await onAllReady(req.route.app)
  }
  return { routes, context: req.route, body }
}

// The return value of this function gets registered as reply.html()
export async function createHtmlFunction (source, _, config) {
  // Creates `universal` and `serverOnly` sets of
  // HTML `beforeElement` and `afterElement` templates
  const templates = await createHtmlTemplates(source, config)

  // Registered as reply.html()
  return async function () {
    const { routes, context, body } = await this.render()

    context.useHead.push(context.head)
    this.type('text/html')

    // Use template with client module import removed
    if (context.serverOnly) {
      // Turn off hydration
      context.hydration = ''

      return streamShell(
        templates.serverOnly,
        context,
        body,
      )
    }

    // Embed full hydration script
    context.hydration = (
      `<script>\nwindow.route = ${
        // Server data payload
        devalue.uneval(context.toJSON())
      }\nwindow.routes = ${
        // Universal router payload
        devalue.uneval(routes.toJSON())
      }\n</script>`
    )

    // In all other cases use universal,
    // template which works the same for SSR and CSR.

    if (context.clientOnly) {
      return sendClientOnlyShell(templates.universal, context)
    }

    return streamShell(templates.universal, context, body)
  }
}

export async function sendClientOnlyShell (templates, context) {
  return await transformHtmlTemplate(
    context.useHead,
    `${
      templates.beforeElement(context)
    }${
      templates.afterElement(context)
    }`
  )
}

export function streamShell (templates, context, body) {
  return Readable.from(createShellStream(templates, context, body))
}

async function * createShellStream (templates, context, body) {
  yield await transformHtmlTemplate(
    context.useHead,
    templates.beforeElement(context)
  )

  for await (const chunk of body) {
    yield await transformHtmlTemplate(
      context.useHead,
      chunk.toString()
    )
  }
  yield await transformHtmlTemplate(
    context.useHead,
    templates.afterElement(context)
  )
}

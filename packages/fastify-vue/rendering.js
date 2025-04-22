import { Readable } from 'node:stream'
import { renderToString, renderToNodeStream } from 'vue/server-renderer'
import * as devalue from 'devalue'
import { createHead, transformHtmlTemplate } from '@unhead/vue/server'
import { createHtmlTemplates } from './templating.js'

export async function createRenderFunction ({ routes, create }) {
  // Used when hydrating Vue Router on the client
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
  req.route.router.push(req.url)
  await req.route.router.isReady()
  // SSR stream
  const body = renderToNodeStream(req.route.app, req.route.ssrContext)
  return { routes, context: req.route, body }
}

async function createResponse (req, routes) {
  let body
  if (!req.route.clientOnly) {
    req.route.router.push(req.url)
    await req.route.router.isReady()
    // SSR string
    body = await renderToString(req.route.app, req.route.ssrContext)
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

    // Apply head attributes
    if (!context.useHead) {
      context.useHead = createHead()
    }

    context.useHead.push(context.head)
    this.type('text/html')

    // Use template with client module import removed
    if (context.serverOnly) {
      // Turn off hydration
      context.hydration = ''

      if (context.streaming) {
        return streamShell(
          templates.serverOnly,
          context,
          body,
        )
      }
      return sendShell(
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
    // Streaming is not available for `clientOnly` responses

    if (context.streaming) {
      // Streaming response
      return streamShell(templates.universal, context, body)
    }

    // Standard synchronous response
    return sendShell(templates.universal, context, body)
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

export async function sendShell (templates, context, body) {
  return await transformHtmlTemplate(
    context.useHead,
  `${
    templates.beforeElement(context)
  }${
    body
  }${
    templates.afterElement(context)
  }`)
}

export async function streamShell (templates, context, body) {
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
      chunk
    )
  }
  yield await transformHtmlTemplate(
    context.useHead,
    templates.afterElement(context)
  )
}

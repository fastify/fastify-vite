import { Readable } from 'node:stream'
import type { FastifyInstance, FastifyReply } from 'fastify'
import type { RuntimeConfig } from '@fastify/vite'
import type { App } from 'vue'
import type { Router } from 'vue-router'
import { renderToString, renderToNodeStream } from 'vue/server-renderer'
import * as devalue from 'devalue'
import { createHead, transformHtmlTemplate } from '@unhead/vue/server'
import type { SSRHeadPayload } from '@unhead/vue/server'
import type { VueHeadClient, UseHeadInput } from '@unhead/vue'
import { createHtmlTemplates, type HtmlTemplates } from './templating.ts'
import type RouteContext from './context.ts'
import type { CreateFactory, KeyedRoute } from './types/route.ts'

type TemplatesPair = HtmlTemplates['universal']

interface RoutesList extends Array<KeyedRoute> {
  toJSON(): unknown
}

interface RouteContextWithRuntime extends RouteContext {
  router: Router
  app: App
  useHead?: VueHeadClient<UseHeadInput, SSRHeadPayload>
  hydration?: string
}

export async function createRenderFunction({
  routes,
  create: _create,
}: {
  routes: RoutesList
  create: CreateFactory
}) {
  // Used when hydrating Vue Router on the client
  const routeMap = Object.fromEntries(routes.map((r) => [r.key, r]))
  // Registered as reply.render()
  return function (this: { request: { route: RouteContextWithRuntime; url: string } }) {
    if (this.request.route.streaming) {
      return createStreamingResponse(this.request, routes, routeMap)
    }
    return createResponse(this.request, routes, routeMap)
  }
}

async function createStreamingResponse(
  req: { route: RouteContextWithRuntime; url: string },
  routes: RoutesList,
  _routeMap: Record<string, KeyedRoute>,
) {
  req.route.router.push(req.url)
  await req.route.router.isReady()
  // SSR stream
  const body = renderToNodeStream(req.route.app, req.route.ssrContext)
  return { routes, context: req.route, body }
}

async function createResponse(
  req: { route: RouteContextWithRuntime; url: string },
  routes: RoutesList,
  _routeMap: Record<string, KeyedRoute>,
) {
  let body: string | undefined
  if (!req.route.clientOnly) {
    req.route.router.push(req.url)
    await req.route.router.isReady()
    // SSR string
    body = await renderToString(req.route.app, req.route.ssrContext)
  }
  return { routes, context: req.route, body }
}

// The return value of this function gets registered as reply.html()
export async function createHtmlFunction(
  source: string,
  _scope: FastifyInstance,
  config: RuntimeConfig,
) {
  // Creates `universal` and `serverOnly` sets of
  // HTML `beforeElement` and `afterElement` templates
  const templates = createHtmlTemplates(source, config)

  // Registered as reply.html()
  return async function (
    this: Omit<FastifyReply, 'render'> & {
      render: () => Promise<{
        routes: RoutesList
        context: RouteContextWithRuntime
        body: string | Readable | undefined
      }>
    },
  ) {
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
        return streamShell(templates.serverOnly, context, body as Readable)
      }
      return sendShell(templates.serverOnly, context, body as string)
    }

    // Embed full hydration script
    context.hydration = `<script>\nwindow.route = ${
      // Server data payload
      devalue.uneval(context.toJSON())
    }\nwindow.routes = ${
      // Universal router payload
      devalue.uneval(routes.toJSON())
    }\n</script>`

    // In all other cases use universal,
    // template which works the same for SSR and CSR.
    if (context.clientOnly) {
      return sendClientOnlyShell(templates.universal, context)
    }
    // Streaming is not available for `clientOnly` responses

    if (context.streaming) {
      // Streaming response
      return streamShell(templates.universal, context, body as Readable)
    }

    // Standard synchronous response
    return sendShell(templates.universal, context, body as string)
  }
}

export function sendClientOnlyShell(templates: TemplatesPair, context: RouteContextWithRuntime) {
  return transformHtmlTemplate(
    context.useHead!,
    `${templates.beforeElement(context)}${templates.afterElement(context)}`,
  )
}

export function sendShell(
  templates: TemplatesPair,
  context: RouteContextWithRuntime,
  body: string,
) {
  return transformHtmlTemplate(
    context.useHead!,
    `${templates.beforeElement(context)}${body}${templates.afterElement(context)}`,
  )
}

export function streamShell(
  templates: TemplatesPair,
  context: RouteContextWithRuntime,
  body: Readable,
) {
  return Readable.from(createShellStream(templates, context, body))
}

async function* createShellStream(
  templates: TemplatesPair,
  context: RouteContextWithRuntime,
  body: Readable,
) {
  const useHead = context.useHead!
  yield transformHtmlTemplate(useHead, templates.beforeElement(context))

  for await (const chunk of body) {
    yield transformHtmlTemplate(useHead, chunk.toString())
  }
  yield transformHtmlTemplate(useHead, templates.afterElement(context))
}

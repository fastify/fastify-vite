import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { App } from 'vue'
import type { Router } from 'vue-router'
import type { UseHeadInput, VueHeadClient } from '@unhead/vue'
import type { ContextInit } from './types/context.ts'
import type { RouteDefinition } from './types/route.ts'

const routeContextInspect = Symbol.for('nodejs.util.inspect.custom')

export default class RouteContext {
  server: FastifyInstance
  req: FastifyRequest
  reply: FastifyReply
  ssrContext: Record<string, unknown>
  firstRender: boolean
  head: UseHeadInput
  data: unknown
  key: string | undefined
  meta: Record<string, unknown> | undefined
  state: Record<string, unknown> | null
  layout: string | undefined
  streaming: boolean | undefined
  clientOnly: boolean | undefined
  serverOnly: boolean | undefined
  getMeta: boolean
  getData: boolean
  onEnter: boolean
  actions?: unknown
  error?: unknown
  app?: App
  router?: Router
  store?: unknown
  useHead?: VueHeadClient

  static async create(
    server: FastifyInstance,
    req: FastifyRequest,
    reply: FastifyReply,
    route: RouteDefinition,
    contextInit?: ContextInit,
  ): Promise<RouteContext> {
    const routeContext = new RouteContext(server, req, reply, route)
    if (contextInit) {
      if (contextInit.state) {
        routeContext.state = contextInit.state()
      }
      if (contextInit.default) {
        await contextInit.default(routeContext)
      }
    }
    return routeContext
  }

  static extend(initial: ContextInit): void {
    const { default: _def, ...extra } = initial
    for (const [prop, value] of Object.entries(extra)) {
      if (prop !== 'data' && prop !== 'state') {
        Object.defineProperty(RouteContext.prototype, prop, { enumerable: true, value })
      }
    }
  }

  constructor(
    server: FastifyInstance,
    req: FastifyRequest,
    reply: FastifyReply,
    route: RouteDefinition,
  ) {
    this.server = server
    this.req = req
    this.reply = reply
    // Internal
    this.ssrContext = {}
    this.firstRender = true
    // Populated
    this.head = {}
    this.data = route.data
    this.key = route.key
    this.meta = route.meta
    this.state = null
    // Route settings
    this.layout = route.layout
    this.streaming = route.streaming
    this.clientOnly = route.clientOnly
    this.serverOnly = route.serverOnly
    this.getMeta = !!route.getMeta
    this.getData = !!route.getData
    this.onEnter = !!route.onEnter
  }

  [routeContextInspect](): unknown {
    return {
      ...this,
      actions: this.actions,
      server: { [routeContextInspect]: () => '[Server]' },
      req: { [routeContextInspect]: () => '[Request]' },
      reply: { [routeContextInspect]: () => '[Reply]' },
    }
  }

  // Serialized into the SSR hydration payload (`window.route`).
  // `serverOnly` and `streaming` are deliberately omitted because hydration
  // doesn't run for `serverOnly` responses and `streaming` only affects how
  // the body is delivered to the client. `error` is server-only state.
  toJSON(): Record<string, unknown> {
    return {
      state: this.state,
      data: this.data,
      key: this.key,
      meta: this.meta,
      head: this.head,
      layout: this.layout,
      getMeta: this.getMeta,
      getData: this.getData,
      onEnter: this.onEnter,
      firstRender: this.firstRender,
      clientOnly: this.clientOnly,
    }
  }
}

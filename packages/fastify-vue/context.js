
const routeContextInspect = Symbol.for('nodejs.util.inspect.custom')

export default class RouteContext {
  static async create (server, req, reply, route, contextInit) {
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

  constructor (server, req, reply, route) {
    this.server = server
    this.req = req
    this.reply = reply
    // Internal
    this.ssrContext = {}
    this.firstRender = true
    // Populated
    this.head = {}
    this.data = route.data
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

  [routeContextInspect] () {
    return {
      ...this,
      actions: this.actions,
      server: { [routeContextInspect]: () => '[Server]' },
      req: { [routeContextInspect]: () => '[Request]' },
      reply: { [routeContextInspect]: () => '[Reply]' },
    }
  }

  toJSON () {
    return {
      state: this.state,
      data: this.data,
      layout: this.layout,
      getMeta: this.getMeta,
      getData: this.getData,
      onEnter: this.onEnter,
      firstRender: this.firstRender,
      clientOnly: this.clientOnly,
    }
  }
}

RouteContext.extend = (initial) => {
  const { default: _, ...extra } = initial
  for (const [prop, value] of Object.entries(extra)) {
    if (prop !== 'data' && prop !== 'state') {
      Object.defineProperty(RouteContext.prototype, prop, { enumerable: true, value })
    }
  }
}

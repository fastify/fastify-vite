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
    this.head = {}
    this.state = null
    this.data = route.data
    this.firstRender = true
    this.layout = route.layout
    this.getMeta = !!route.getMeta
    this.getData = !!route.getData
    this.onEnter = !!route.onEnter
    this.streaming = route.streaming
    this.clientOnly = route.clientOnly
    this.serverOnly = route.serverOnly
  }

  [routeContextInspect] () {
    return {
      ...this,
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

RouteContext.extend = function (initial) {
  const { default: _, ...extra } = initial
  for (const [prop, value] of Object.entries(extra)) {
    if (prop !== 'data' && prop !== 'state') {
      Object.defineProperty(RouteContext.prototype, prop, value)
    }
  }
}

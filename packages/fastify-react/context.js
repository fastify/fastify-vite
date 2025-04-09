const routeContextInspect = Symbol.for('nodejs.util.inspect.custom')

export default class RouteContext {
  static async create(server, req, reply, route, contextInit) {
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

  constructor(server, req, reply, route) {
    this.path = route.path
    this.server = server
    this.req = req
    this.reply = reply
    this.head = {}
    this.actionData = {}
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

  [routeContextInspect]() {
    return {
      ...this,
      server: { [routeContextInspect]: () => '[Server]' },
      req: { [routeContextInspect]: () => '[Request]' },
      reply: { [routeContextInspect]: () => '[Reply]' },
    }
  }

  toJSON() {
    const json = {}
    json.path = this.path
    if (this.actionData) {
      json.actionData = this.actionData
    }
    if (this.state) {
      json.state = this.state
    }
    if (this.data) {
      json.data = this.data
    }
    if (this.layout) {
      json.layout = this.layout
    }
    if (this.getMeta) {
      json.getMeta = this.getMeta
    }
    if (this.getData) {
      json.getData = this.getData
    }
    if (this.onEnter) {
      json.onEnter = this.onEnter
    }
    if (this.firstRender) {
      json.firstRender = this.firstRender
    }
    if (this.clientOnly) {
      json.clientOnly = this.clientOnly
    }
    return json
  }
}

RouteContext.extend = (initial) => {
  const { default: _, ...extra } = initial
  for (const [prop, value] of Object.entries(extra)) {
    if (prop !== 'data' && prop !== 'state') {
      Object.defineProperty(RouteContext.prototype, prop, value)
    }
  }
}

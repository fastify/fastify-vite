const fp = require('fastify-plugin')

const { ensureConfigFile, ejectBlueprint } = require('./setup')
const { configure, resolveBuildCommands, viteESModuleSSR } = require('./config')
const { setup: setupProduction } = require('./mode/production')
const { setup: setupDevelopment } = require('./mode/development')

class Vite {
  scope = null
  setupMode = null
  options = null
  constructor (scope, options) {
    // Hold reference to Fastify encapsulation context
    this.scope = scope
    // Determine which setup function to use
    this.setupMode = options.dev
      // Boots Vite's development server and ensures hot reload
      ? setupDevelopment
      // Assumes presence of and uses production bundled distribution
      : setupProduction
    // Hold reference to user-provided plugin options
    this.options = options
  }

  async ready () {
    // Process all user-provided options and compute all Vite configuration settings
    this.config = await configure(this.options)
    // Get handler function and routes based on the Vite server bundle
    const { handler, routes } = await this.setupMode(this.config)
    // Use createRouteFunction() from main config or for renderer if set
    const createRouteFunction = (
      this.config.createRouteFunction ?? this.config.renderer.createRouteFunction
    )
    // Create instance.vite.route() method
    this.route = createRouteFunction(this.scope, handler)
    // Automatically create routes exported by the Vite server entry point
    for (const route of routes) {
      this.route(route.path, route)
    }
  }

  // Shortcut to create GET routes, can only be called after instance.vite.ready()
  get (url, routeOptions) {
    return this.route(url, { method: 'GET', ...routeOptions })
  }

  // Shortcut to create POST routes, can only be called after instance.vite.ready()
  post (url, { data, method, ...routeOptions } = {}) {
    return this.route(url, { data, method: 'POST', ...routeOptions })
  }
}

function fastifyVite (scope, options, done) {
  scope.decorate('vite', new Vite(scope, options))
  done()
}

module.exports = fp(fastifyVite)
module.exports.ensureConfigFile = ensureConfigFile
module.exports.ejectBlueprint = ejectBlueprint
module.exports.resolveBuildCommands = resolveBuildCommands
module.exports.viteESModuleSSR = viteESModuleSSR
module.exports.default = module.exports

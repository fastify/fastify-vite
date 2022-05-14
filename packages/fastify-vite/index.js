'use strict'

const fp = require('fastify-plugin')

const { ensureConfigFile, ejectBlueprint } = require('./setup')
const { configure, resolveBuildCommands, viteESModuleSSR } = require('./config')

const setupProduction = require('./mode/production')
const setupDevelopment = require('./mode/development')

const kOptions = Symbol('kOptions')

class Vite {
  constructor (scope, options) {
    // Hold reference to Fastify encapsulation context
    this.scope = scope
    // Determine which setup function to use
    this.setupMode = options.dev
      // Boots Vite's development server and ensures hot reload
      ? setupDevelopment
      // Assumes presence of and uses production bundled distribution
      : setupProduction
    // Private reference to user-provided plugin options
    this[kOptions] = options
  }

  async ready () {
    // Process all user-provided options and compute all Vite configuration settings
    this.config = await configure(this[kOptions])
    // Get handler function and routes based on the Vite server bundle
    const { routes, handler, errorHandler } = await this.setupMode(this.config)
    // Register individual Fastify routes for each the client-provided routes
    if (routes && typeof routes[Symbol.iterator] === 'function') {
      for (const route of routes) {
        this.config.createRoute(this.scope, { handler, errorHandler, route })
      }
    }
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

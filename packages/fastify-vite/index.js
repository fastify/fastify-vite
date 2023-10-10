'use strict'

const fp = require('fastify-plugin')

const { ensureConfigFile, ejectBlueprint } = require('./setup')
const { configure } = require('./config')
const { createHtmlTemplateFunction } = require('./html')
const { ensureESMBuild } = require('./vite')

const kSetup = Symbol('kSetup')
const kOptions = Symbol('kOptions')

class Vite {
  constructor (scope, options) {
    // Hold reference to Fastify encapsulation context
    this.scope = scope
    this.createServer = options.createServer
    this[kOptions] = options
  }

  async ready () {
    // Process all user-provided options and compute all Vite configuration settings
    this.config = await configure(this[kOptions])
    // Determine which setup function to use
    this[kSetup] = this.config.dev
      // Boots Vite's development server and ensures hot reload
      ? require('./mode/development')
      // Assumes presence of and uses production bundled distribution
      : require('./mode/production')
    // Private reference to user-provided plugin options
    // Get handler function and routes based on the Vite server bundle
    const { client, routes, handler, errorHandler } = await this[kSetup](this.config, this.createServer)

    // Register individual Fastify routes for each the client-provided routes
    if (routes && typeof routes[Symbol.iterator] === 'function') {
      for (const route of routes) {
        this.config.createRoute({ client, handler, errorHandler, route }, this.scope, this.config)
      }
    }
  }
}

function fastifyVite (scope, options, done) {
  scope.decorate('vite', new Vite(scope, options))
  done()
}

module.exports = fp(fastifyVite, {
  name: '@fastify/vite'
})
module.exports.ensureESMBuild = ensureESMBuild
module.exports.createHtmlTemplateFunction = createHtmlTemplateFunction
module.exports.ensureConfigFile = ensureConfigFile
module.exports.ejectBlueprint = ejectBlueprint
module.exports.default = module.exports

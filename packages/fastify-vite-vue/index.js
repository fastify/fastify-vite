const { resolve } = require('path')
const { options } = require('./options')
const { getHandler, getDevHandler } = require('./handler')
const { getEntry, getDevEntry } = require('./entry')
const { compileIndexHtml } = require('./html')

module.exports = {
  path: resolve(__dirname),
  blueprint: [
    'entry/client.js',
    'entry/server.js',
    'client.js',
    'client.vue',
    'head.js',
    'index.html',
    'routes.js',
  ],
  options,
  compileIndexHtml,
  getHandler,
  getEntry,
  dev: {
    getHandler: getDevHandler,
    getEntry: getDevEntry,
  },
}

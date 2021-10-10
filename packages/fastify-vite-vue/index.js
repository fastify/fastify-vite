const { options } = require('./options')
const { getHandler, getDevHandler } = require('./handler')
const { getEntry, getDevEntry } = require('./entry')
const { getRenderer, getDevRenderer } = require('./island')

module.exports = {
  options,
  getHandler,
  getRenderer,
  getEntry,
  dev: {
    getHandler: getDevHandler,
    getRenderer: getDevRenderer,
    getEntry: getDevEntry,
  },
}

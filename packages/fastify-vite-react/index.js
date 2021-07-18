const { options } = require('./options')
const { getHandler, getDevHandler } = require('./handler')
const { getEntry, getDevEntry } = require('./entry')

module.exports = {
  options,
  getHandler,
  getEntry,
  dev: {
    getHandler: getDevHandler,
    getEntry: getDevEntry,
  },
}

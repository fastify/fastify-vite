const { getHandler, getRenderGetter } = require('./handler')
const { useServerData, useServerAPI } = require('./hooks')
const { hydrate } = require('./hydrate')

module.exports = {
  renderer: 'react',
  getHandler,
  getRenderGetter,
  useServerData,
  useServerAPI,
  hydrate
}

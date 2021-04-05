const { getHandler, getRenderGetter } = require('./handler')
const { useServerData, useServerAPI } = require('./hooks')
const { hydrate } = require('./hydrate')
const { ContextProvider, useSSEContext } = require('./context')

module.exports = {
  renderer: 'react',
  getHandler,
  getRenderGetter,
  useServerData,
  useServerAPI,
  hydrate,
  ContextProvider,
  useSSEContext
}

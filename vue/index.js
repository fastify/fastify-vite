const { getHandler, getRenderGetter } = require('./handler')
const { useServerData, useServerAPI } = require('./hooks')
const { hydrate } = require('./hydrate')
const { getRender } = require('./render')

module.exports = {
  renderer: 'vue',
  getHandler,
  getRenderGetter,
  getRender,
  useServerData,
  useServerAPI,
  hydrate,
}

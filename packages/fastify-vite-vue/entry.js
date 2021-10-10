const { resolve } = require('path')

async function getEntry ({ root, entry, distDir }, vite) {
  // Load production template source only once in prod
  const serverBundle = require(resolve(distDir, 'server/server.js'))
  const { views, renderApp, renderIsland } = serverBundle.default ? serverBundle.default : serverBundle
  return { views, renderApp, renderIsland }
}

async function getDevEntry ({ dev, root, entry }, vite) {
  const entryModulePath = resolve(root, entry.server.replace(/^\/+/, ''))
  const entryModule = await vite.ssrLoadModule(entryModulePath)
  const { views } = entryModule.default || entryModule
  return {
    views,
    // Reload template source every time in dev
    async getRenderers () {
      const entryModule = await vite.ssrLoadModule(entryModulePath)
      const { views, ...renderers } = entryModule.default || entryModule
      return renderers
    },
  }
}

module.exports = {
  getEntry,
  getDevEntry,
}

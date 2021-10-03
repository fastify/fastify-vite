const { resolve } = require('path')

async function getEntry ({ root, entry, distDir }, vite) {
  // Load production template source only once in prod
  const serverBundle = require(resolve(distDir, 'server/server.js'))
  const { routes, render } = serverBundle.default ? serverBundle.default : serverBundle
  return { routes, render }
}

async function getDevEntry ({ dev, root, entry }, vite) {
  const entryModule = await vite.ssrLoadModule(
    resolve(root, entry.server.replace(/^\/+/, '')),
  )
  const { routes } = entryModule.default || entryModule
  return {
    routes,
    // Reload template source every time in dev
    async getRender () {
      const entryModule = await vite.ssrLoadModule(
        resolve(root, entry.server.replace(/^\/+/, '')),
      )
      const { render } = entryModule.default || entryModule
      return render
    },
  }
}

module.exports = {
  getEntry,
  getDevEntry,
}

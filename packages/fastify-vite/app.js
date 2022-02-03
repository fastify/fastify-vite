const { packIsland } = require('./islands.js')
const { onIdle, onMedia, onDisplay } = require('./client.js')

function flattenPaths (viewPath) {
  if (!viewPath) {
    return []
  }
  if (typeof viewPath === 'string') {
    return [viewPath]
  }
  if (Array.isArray(viewPath)) {
    return viewPath
  }
  return []
}

function getRoutes (views) {
  const routes = []
  for (const [componentPath, view] of Object.entries(views)) {
    const { default: component, ...viewProps } = view
    for (const path of flattenPaths(view.path)) {
      routes.push({ path, componentPath, component, ...viewProps })
    }
  }
  return routes.sort((a, b) => {
    if (b.path > a.path) {
      return 1
    } else if (a.path > b.path) {
      return -1
    } else {
      return 0
    }
  })
}

module.exports = {
  flattenPaths,
  getRoutes,
  packIsland,
  onIdle,
  onMedia,
  onDisplay,
}

const { packIsland } = require('./islands.js')
const { onIdle, onMedia, onDisplay } = require('./client.js')

function flattenPaths (view) {
  const paths = []
  if (view.path && Array.isArray(view.path)) {
    for (const path of view.path) {
      paths.push(path)
    }
  } else if (view.path) {
    paths.push(view.path)
  }
  return paths
}

function getRoutes (views, ssr) {
  const routes = []
  for (const [componentPath, view] of Object.entries(views)) {
    for (const path of flattenPaths(view)) {
      const { default: component, ...viewProps } = view
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

const { packIsland } = require('./islands.js')
const { onIdle, onMedia, onDisplay } = require('./client.js')

function * getViewRoutes (view) {
  if (view.path && Array.isArray(view.path)) {
    for (const path of view.path) {
      const { default: component, ...viewProps } = view
      yield { path, component, ...viewProps }
    }
  } else if (view.path) {
    const { path, default: component, ...viewProps } = view
    yield { path, component, ...viewProps }
  } else {
    throw new Error('View components need to export a `path` property.')
  }
}

function getAllRoutes (views) {
  const routes = []
  for (const view of Object.values(views)) {
    for (const route of getViewRoutes(view)) {
      routes.push(route)
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
  getViewRoutes,
  getAllRoutes,
  packIsland,
  onIdle,
  onMedia,
  onDisplay,
}

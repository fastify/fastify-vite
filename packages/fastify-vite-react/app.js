const { values } = Object

function loadRoutes (views) {
  const routes = []
  for (const view of values(views)) {
    if (view.path && Array.isArray(view.path)) {
      routes.push(...view.path.map((path) => ({
        path,
        component: view.default,
        name: view.default.name,
        getData: view.getData,
      })))
    } else if (view.path) {
      routes.push({
        path: view.path,
        component: view.default,
        name: view.default.name,
        getData: view.getData,
      })
    } else {
      throw new Error('View components need to export a `path` property.')
    }
  }
  return routes
}

module.exports = { loadRoutes }

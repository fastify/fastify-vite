const { values } = Object

function loadRoutes (views) {
  const routes = []
  for (const view of values(views)) {
    if (view.path && Array.isArray(view.path)) {
      routes.push(
        ...view.path.map((path) => {
          const { default: component, ...viewProps } = view
          return { path, component, ...viewProps }
        }),
      )
    } else if (view.path) {
      const { path, default: component, ...viewProps } = view
      routes.push({ path, component, ...viewProps })
    } else {
      throw new Error('View components need to export a `path` property.')
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

module.exports = { loadRoutes }

/* eslint-disable no-cond-assign */

export function getPageRoutes (importMap) {
  return Object.keys(importMap)
    // Ensure that static routes have
    // precedence over the dynamic ones
    .sort((a, b) => a > b ? -1 : 1)
    .map((path) => ({
      path: path
        // Remove /pages and .jsx extension
        .slice(6, -4)
        // Replace [id] with :id
        .replace(/\[(\w+)\]/, (_, m) => `:${m}`)
        // Replace '/index' with '/'
        .replace(/\/index$/, '/'),
      // The React component (default export)
      component: importMap[path].default,
      // The getServerSideProps individual export
      getServerSideProps: importMap[path].getServerSideProps
    }))
}

export function createPageManager ({
  ctx,
  router,
  routes,
  ssr
}) {
  return (instance) => {
    const globalProperties = instance.config.globalProperties
    globalProperties.$error = null
    if (ssr) {
      // Populate serverSideProps with SSR context data
      globalProperties.$serverSideProps = ctx.serverSideProps
    } else {
      // Populate serverSideProps with hydrated SSR context data if avilable
      globalProperties.$serverSideProps = window.hydration.serverSideProps
    }
    // A way to quickly access getServerSideProps by matched path
    const routeMap = Object.fromEntries(
      routes.map(({ path, getServerSideProps }) => {
        return [path, getServerSideProps]
      })
    )
    // Set up Vue Router hook
    if (!import.meta.env.SSR) {
      router.beforeEach(async (to) => {
        // Ensure hydration is always reset after a page renders
        window.hydration = {}
        // If getServerSideProps is set...
        if (routeMap[to.matched[0].path]) {
          await fetch(`/json${to.path}`)
            .then((response) => response.json())
            .then((data) => {
              if (data.statusCode === 500) {
                globalProperties.$error = data.message
              } else {
                globalProperties.$serverSideProps = data
              }
            })
            .catch((error) => {
              globalProperties.$error = error
            })
        }
      })
    }
  }
}


function getPageRoutes (importMap) {
  const routes = []
  return Object.keys(importMap)
    // Ensure that static routes have 
    // precedence over the dynamic ones
    .sort((a, b) => a > b ? -1 : 1)
    .map((path) => ({
      path: path
        // Remove /pages
        .slice(6)
        // Replace [id] with :id
        .replace(/\[(\w+)\]/, (_, m) => `:${m}`)
        // Remove .jsx extension
        .slice(0, -4)
        // Replace '/index' with '/'
        .replace(/\/index$/, '/'),
      // The React component (default export)
      component: importMap[path].default,
      // The getServerSideProps individual export
      getServerSideProps: importMap[path].getServerSideProps,
    }))
}

export default getPageRoutes(
  import.meta.globEager('/pages/**/*.jsx')
)

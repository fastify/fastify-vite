
function hydrate (app, dataKey) {
  const dataSymbol = Symbol.for(dataKey)
  app.config.globalProperties.$dataPath = () => `/-/data${document.location.pathname}`
  app.config.globalProperties[dataKey] = window[dataSymbol]
  delete window[dataSymbol]

  const apiSymbol = Symbol.for('fastify-vite-api')
  app.config.globalProperties.$api = window[apiSymbol]
  delete window[apiSymbol]
}

import createApp from './app.jsx'
import Context from './context.js'
import routes from './routes.js'

export default (createRenderFunction) => ({
  routes,
  render: createRenderFunction(createApp, { Context }),
})

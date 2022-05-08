import createApp from './app.jsx'
import { RouteContextProvider } from './context.jsx'
import routes from './routes.js'

export default (createRenderFunction) => ({
  routes,
  render: createRenderFunction(createApp, { RouteContextProvider }),
})

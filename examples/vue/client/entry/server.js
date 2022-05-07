import createApp from './app'
import routes from './routes.js'

export default (createRenderFunction) => ({
  routes,
  render: createRenderFunction(createApp),
})

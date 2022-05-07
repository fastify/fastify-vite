import { createApp } from './app.jsx'
import Context from './context.js'
import routes from './routes.js'

console.log(Context)

export default (createRenderFunction) => ({
  routes,
  render: createRenderFunction(createApp, { Context }),
})

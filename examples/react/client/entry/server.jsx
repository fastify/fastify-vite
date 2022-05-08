import React from 'react'
import { createRouter } from './app.jsx'
import routes from './routes.js'

export default (createRenderFunction) => ({
  routes,
  render: createRenderFunction(createRouter),
})

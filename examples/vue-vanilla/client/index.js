import { createApp } from './base.js'
import routes from './routes.js'

export default {
  // Provides client-side navigation routes to server
  routes,
  // Provides function needed to perform SSR
  createApp
}

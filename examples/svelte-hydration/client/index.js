import Base from './base.svelte'
import routes from './routes.js'

export default {
  // Provides client-side navigation routes to server
  routes,
  // Provides function needed to perform SSR
  Base,
}

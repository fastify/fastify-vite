import { getPageRoutes } from './next.jsx'

export default getPageRoutes(
  import.meta.globEager('/pages/**/*.jsx')
)

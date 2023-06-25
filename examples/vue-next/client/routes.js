import { getPageRoutes } from './next.js'

export default getPageRoutes(import.meta.globEager('/pages/**/*.vue'))

import { getPageRoutes } from './next.js'

export default getPageRoutes(import.meta.glob('/pages/**/*.vue', { eager: true }))

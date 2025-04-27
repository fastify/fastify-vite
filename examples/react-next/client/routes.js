import { getPageRoutes } from './next.jsx'

export default getPageRoutes(import.meta.glob('/pages/**/*.jsx', { eager: true }))

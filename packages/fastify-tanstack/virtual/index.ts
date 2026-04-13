import { createAppRouter } from '$app/create.tsx'

export { createAppRouter }

export function getRoutes() {
  const router = createAppRouter()
  return Object.entries(router.routesByPath).map(([_path, route]) => ({
    path: route.fullPath,
  }))
}

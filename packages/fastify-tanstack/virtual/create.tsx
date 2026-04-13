import { createRouter } from '@tanstack/react-router'
import { routeTree } from '$app/routes.ts'

export function createAppRouter() {
  return createRouter({
    routeTree,
  })
}

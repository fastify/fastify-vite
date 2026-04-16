import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routes.ts'

export function createAppRouter() {
  return createRouter({
    routeTree,
  })
}

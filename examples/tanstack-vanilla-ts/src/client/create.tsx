import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routes.ts'

interface User {
  name: string
}

export interface RouterContext {
  user: User | null
}

export function createAppRouter(req?: { user?: User | null }) {
  return createRouter({
    routeTree,
    context: {
      user: req?.user ?? null,
    },
  })
}

import { useRouteContext } from '@fastify/vue/client'

export function useState () {
  return useRouteContext().state
}

export function useData () {
  return useRouteContext().data
}

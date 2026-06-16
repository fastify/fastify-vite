import type { RouteDefinition } from './route.ts'

export interface ClientModule {
  create?: (...args: never[]) => unknown
  routes?:
    | Iterable<RouteDefinition>
    | (() => Iterable<RouteDefinition> | Promise<Iterable<RouteDefinition>>)
  [key: string]: unknown
}

export interface ClientEntries {
  ssr?: ClientModule
  [env: string]: ClientModule | undefined
}

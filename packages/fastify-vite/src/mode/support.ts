import type { FastifyInstance } from 'fastify'
import type { ViteDevServer } from 'vite'
import type { ModuleRunner } from 'vite/module-runner'
import type { ClientEntries, ClientModule } from '../types/client.ts'
import type { RuntimeConfig } from '../types/options.ts'
import type { RouteDefinition } from '../types/route.ts'

/** Shared setup context interface used by both dev and production setup functions */
export interface FastifyViteDecorationPriorToSetup {
  scope: FastifyInstance
  runtimeConfig: RuntimeConfig
  devServer?: ViteDevServer
  entries?: ClientEntries
  runners?: Record<string, ModuleRunner>
}

/** Check if an object has iterable routes */
export function hasIterableRoutes(
  client: unknown,
): client is ClientModule & { routes: Iterable<RouteDefinition> } {
  if (!client || typeof client !== 'object') return false
  const maybeClient = client as { routes?: unknown }
  const routes = maybeClient.routes
  return (
    !!routes &&
    typeof routes !== 'string' && // strings are iterable, but not desired here
    typeof (routes as Iterable<unknown>)[Symbol.iterator] === 'function'
  )
}

import type RouteContext from '../context.ts'

/**
 * Initialization module for the route context, provided by the user's
 * app-level `context.js` / `context.ts`. The `state` factory seeds per-request
 * state and the `default` function runs once per request to decorate the
 * `RouteContext` instance with actions and other helpers.
 */
export interface ContextInit {
  state?: () => Record<string, unknown>
  default?: (ctx: RouteContext) => Promise<void> | void
  [key: string]: unknown
}

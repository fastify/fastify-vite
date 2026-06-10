/// <reference types="vite/client" />

// To attach custom properties to the per-request `RouteContext` from your
// app's `context.ts` `default` function, declaration-merge them onto the
// class:
//
//   declare module '@fastify/vue' {
//     interface RouteContext {
//       analytics: AnalyticsClient
//     }
//   }

declare module '$app/hooks' {
  /**
   * Get the route context's state. Generic over the state shape
   * so consumers can type it for their application.
   */
  export function useState<T = unknown>(): T

  /**
   * Get the route context's data (from getData export). Generic over
   * the data shape so consumers can type it for their route.
   */
  export function useData<T = Record<string, unknown>>(): T
}

// The `$app/stores` virtual is generated at build time from the keys exported
// by the host app's `context.{js,ts}` `state` factory. Each key becomes a
// `Proxy` that exposes `.state` plus any action functions registered on that
// key in the route context's `actions`. Augment this module in your project
// (e.g. `client/env.d.ts`) to type the proxies:
//
//   declare module '$app/stores' {
//     export const user: {
//       state: { authenticated: boolean }
//       login(username: string, password: string): Promise<void>
//     }
//   }
declare module '$app/stores' {
  export {}
}

declare module '$app/router.vue' {
  import type { DefineComponent } from 'vue'
  const Router: DefineComponent
  export default Router
}

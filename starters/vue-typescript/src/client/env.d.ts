/// <reference types="@fastify/vue/virtual" />
import type { RouteContext as _RouteContext } from '@fastify/vue'
import type { UseHeadInput as _UseHeadInput } from '@unhead/vue'
import type { App as _App } from 'vue'
import type { Router as _Router } from 'vue-router'
import type { AppState as _AppState, actions as _actions } from './context.ts'

declare global {
  type RouteContext = _RouteContext
  type UseHeadInput = _UseHeadInput
  type App = _App
  type Router = _Router
  type AppState = _AppState
  type AppActions = typeof _actions
}

// App-specific Fastify decorators, matching what server.ts registers
declare module 'fastify' {
  interface FastifyInstance {
    db: {
      todoList: string[]
    }
  }
}

// App-specific store types, augmenting the empty $app/stores module
declare module '$app/stores' {
  export const todoList: {
    state: string[]
    add(item: string): Promise<void>
    remove(index: number): Promise<void>
  }
}

// Thin layer on top of fetch()
// to automatically perform JSON requests
import { sendJSON } from './fetch.ts'
import type { RouteContext } from '@fastify/vue'

export interface AppState extends Record<string, unknown> {
  user: {
    authenticated: boolean
  }
  todoList: string[] | null
}

// The default export function runs exactly once on
// the server and once on the client during the
// first render, that is, it's not executed again
// in subsquent client-side navigation via React Router.
export default (ctx: RouteContext) => {
  if (ctx.server && ctx.state) {
    const state = ctx.state as AppState
    state.todoList = ctx.server.db.todoList
  }
}

// State initializer, must be a function called state
// as this is a special context.js export and has
// special processing, e.g., serialization and hydration
export function state(): AppState {
  return {
    user: {
      authenticated: false,
    },
    todoList: null,
  }
}

// Grouped actions that operate on the state
export const actions = {
  authenticate(state: AppState) {
    state.user.authenticated = true
  },
  todoList: {
    async add(state: AppState, item: string) {
      await sendJSON('/api/todo/items', { method: 'put', json: item })
      state.todoList!.push(item)
    },
    async remove(state: AppState, index: number) {
      await sendJSON('/api/todo/items', { method: 'delete', json: index })
      state.todoList!.splice(index, 1)
    },
  },
}


## Route Context

### Initialization module
  
The starter template includes a sample `context.js` file. This file is optional and can be safely removed. If it's present, Fastify DX automatically loads it and uses it to do any RouteContext extensions or data injections you might need. If you're familiar with [Nuxt.js](https://nuxtjs.org/), you can think of it as a [Nuxt.js plugin](https://nuxtjs.org/docs/directory-structure/plugins/).

**Consuming the route context:**

```js
import { 
  useRouteContext
} from '/dx:core.js'

// ...
const { 
  state, 
  actions
} = useRouteContext()

// ...
actions.addTodoItem(state, value)
```

See the [full example](https://github.com/fastify/fastify-dx/blob/main/starters/vue/client/pages/using-store.vue) in the starter template.

This example demonstrates how to use it to set up an universally available (SSR and CSR) `$fetch` function (using [`ky-universal`](https://www.npmjs.com/package/ky-universal)) and also export some store actions. They're all made available by `useRouteContext()`, covered next.

```js
import ky from 'ky-universal'

export default (ctx) => {
  if (ctx.server) {
    // Populate state.todoList on the server
    ctx.state.todoList = ctx.server.db.todoList
    // It'll get automatically serialized to the client on first render!
  }
}

export const $fetch = ky.extend({
  prefixUrl: 'http://localhost:3000'
})

// Must be a function so each request can have its own state
export const state = () => ({
  todoList: null,
})

export const actions = {
  async addTodoItem (state, item) {
    await $fetch.put('api/todo/items', {
      json: { item },
    })
    state.todoList.push(item)
  },
}
```

See the [full example](https://github.com/fastify/fastify-dx/blob/main/starters/vue/client/context.js) in the starter template.

### The `useRouteContext()` hook

This hook can be used in any Vue component to retrieve a reference to the current route context. It's modelled after the [URMA specification](https://github.com/fastify/fastify-dx/blob/main/URMA.md), with still some rough differences and missing properties in this **alpha release**.

By default, It includes reference to `data` — which is automatically populated if you use the `getData()` function, and `state` which hold references to the global [`reactive()`](https://vuejs.org/api/reactivity-core.html#reactive) object.

It automatically causes the component to be suspended if the `getData()`, `getMeta()` and `onEnter()` functions are asynchronous.

```vue
<template>
  <p>{data.message}</p>
</template>

<script setup>
import { useRouteContext } from '/dx:core.js'
const { data } = useRouteContext()
</script>
```

### Execution order

This graph illustrates the execution order to expect from route context initialization.

```
context.js default function export
└─ getData() function export
   └─ getMeta() function export
      └─ onEnter() function export
         └─ Route module
```

First the `default` function export from `context.js` (if present) is executed. This is where you can manually feed global server data into your application by populating the global state (the route context's `state` property, which is automatically hydrated on the client.

Then `getData()` runs — which populates the route context's `data` property, and is also automatically hydrated on the client. Then `getMeta()`, which populates the route context's `head` property. Then `onEnter()`, and finally your route component.

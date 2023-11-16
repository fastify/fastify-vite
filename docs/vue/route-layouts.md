
## Route Layouts

Fastify DX will automatically load layouts from the `layouts/` folder. By default, `/dx:layouts/default.vue` is used — that is, if a project is missing a `layouts/defaults.vue` file, the one provided by Fastify DX is used instead. 

See the section on [Virtual Modules](https://github.com/fastify/fastify-dx/blob/main/docs/vue/virtual-modules.md) to learn more about this.

You assign a layout to a route by exporting `layout`. 

See [`pages/using-auth.vue`](https://github.com/fastify/fastify-dx/blob/main/starters/vue/pages/using-auth.vue) in the starter template:

```js
export const layout = 'auth'
```

That'll will cause the route to be wrapped in the layout component exported by [`layouts/auth.vue`](https://github.com/fastify/fastify-dx/blob/main/starters/vue/layouts/auth.vue):

```vue
<template>
  <div class="contents">
    <template v-if="!state.user.authenticated">
      <p>This route needs authentication.</p>
      <button @click="authenticate">
        Click this button to authenticate.
      </button>
    </template>
    <slot v-else></slot>
  </div>
</template>

<script>
import { useRouteContext } from '/dx:core.js'

export default {
  setup () {
    const { actions, state } = useRouteContext()
    return {
      state,
      authenticate: () => actions.authenticate(state)
    }
  }
}
</script>
```

Note that like routes, it has access to `useRouteContext()`.

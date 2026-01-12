# Route Layouts

`@fastify/vue` will automatically load layouts from the `layouts/` folder.

By default, the `$app/layouts/default.vue` [**smart import**](/vue/project-structure#smart-imports) is used. If a project is missing `/layouts/defaults.vue` file, the one provided by the virtual module is automatically used. **The default layout is defined as follows**:

```vue
<template>
  <div class="layout">
    <slot></slot>
  </div>
</template>
```

You assign a layout to a route by exporting `layout`.

```js
export const layout = 'auth'
```

That'll will cause the route to be wrapped in the layout component exported by a Vue component placed in `layouts/auth.vue`. Below is a simple example:

```vue
<template>
  <div class="contents">
    <template v-if="!state.user.authenticated">
      <p>This route needs authentication.</p>
      <button @click="authenticate">Click this button to authenticate.</button>
    </template>
    <slot v-else></slot>
  </div>
</template>

<script>
import { useRouteContext } from '@fastify/vue/client'

export default {
  setup() {
    const { actions, state } = useRouteContext()
    return {
      state,
      authenticate: () => actions.authenticate(state),
    }
  },
}
</script>
```

Like route modules, layouts can use `useRouteContext()`.

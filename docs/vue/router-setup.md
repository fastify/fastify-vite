<!--@include: ../guide/parts/links.md-->

# Router Setup

By default, routes are loaded from the `<project-root>/pages` folder, where `<project-root>` refers to the `root` setting in your Vite configuration file.

The route paths are **dynamically inferred from the directory structure**, very much like **Nuxt.js**, and passed to the **Vue Router** instance in `/:create.js`

Alternatively, you can also export a `path` constant from your route modules, in which case it will be used to **override the dynamically inferred paths**:

```vue
<template>
  <p>Route with path export</p>
</template>

<script>
export const path = '/my-page'
</script>
```

## Routes location

You can also change the glob pattern used to determine where to route modules from. Internally, this setting is passed to [Vite's glob importer](https://vitejs.dev/guide/features.html#glob-import).

In your Vite configuration file:

```js
import viteFastifyVue from '@fastify/vue/plugin'

export default {
  plugins: [
    // ...
    viteFastifyVue({ globPattern: '/views/**/*.vue' }),
  ]
}
```

## Dynamic parameters

Dynamic route parameters follow the [Next.js convention](https://nextjs.org/docs/basic-features/pages#pages-with-dynamic-routes) (`[param]`), but that can be overriden by using the `paramPattern` plugin option. For example, this configuration switches the param pattern to the [Remix convention](https://remix.run/docs/en/v1/guides/routing#dynamic-segments) (`$param`).

In your Vite configuration file:

```js
import viteFastifyVue from '@fastify/vue/plugin'

export default {
  plugins: [
    // ...
    viteFastifyVue({ paramPattern: /\$(\w+)/ }),
  ],
}
```

## Scroll behavior

Scroll behavior can be set by exporting the function `scrollBehavior` in `root.vue`. See [Scroll Bahavior](https://router.vuejs.org/guide/advanced/scroll-behavior) on how to use it.

In your `root.vue` file:  

```js
export function scrollBehavior() {
  // Always scroll to the top
  return { top: 0, left: 0 };
}
```

<!--@include: ../guide/parts/links.md-->

# Router Setup

By default, routes are loaded from the `<project-root>/pages` folder, where `<project-root>` refers to the `root` setting in your Vite configuration file.

The route paths are **dynamically inferred from the directory structure**, very much like **Nuxt.js**, and passed to the **Vue Router** instance in `$app/create.js`

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

Internally, the route modules location is set via the `$app/routes.js` [virtual module](/vue/project-structure#smart-imports), which is defined as follows by default:

```js
export default import.meta.glob('/pages/**/*.vue')
```

To change the location where routes are loaded from, just place a `routes.js` file at your Vite project's root directory and `@fastify/vue/plugin` will automatically recognize it and use it instead.

### Route customization

You can override the virtual `index.js` to provide your own `createRoutes` function. This will allow you to construct routes however you want to.
If you have multiple routes with the same `path`, you can supply a `key` in the route object instead (`en__index`, `fr__index` for example). You can also supply a `meta` object for the route, this gets passed to the vue router.

This allows for functionality like per domain/locale routing by setting the key to something like `${domain}__route_name` or `${locale}__route_name` like in the example above.  
_Note that this also requires you to override `create.js` and provide your own route matching._

## Dynamic parameters

Dynamic route parameters uses `[param]` for a singular parameter and `[param+]` for wildcard routes.

## Scroll behavior

Scroll behavior can be set by exporting the function `scrollBehavior` in `root.vue`. See [Scroll Behavior](https://router.vuejs.org/guide/advanced/scroll-behavior) on how to use it.

In your `root.vue` file:

```js
export function scrollBehavior() {
  // Always scroll to the top
  return { top: 0, left: 0 }
}
```

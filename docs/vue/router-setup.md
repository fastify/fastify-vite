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

## Internationalization

### Locale prefix

If you want to prefix your routes with the locale, set `localePrefix` to `true`.

In your Vite configuration file:  

```js
import viteFastifyVue from '@fastify/vue/plugin'

export default {
  plugins: [
    // ...
    viteFastifyVue({ defaultLocale: 'en', localePrefix: true }),
  ]
}
```

In your Vue template file:  

```vue
<script>
// Define routes that aren't the default locale (en)
export const i18n = {
  'sv': '/product',
  'da': '/product',
}
</script>
```

Routes will be `/en/product`, `/sv/product` and `/da/product`. **Note:** The index `/` route will default to the default locale.


### Per domain

If you want to match routes per domain you can use the option `localeDomains` to define a domain for each of your locales.

In your Vite configuration file:  

```js
import viteFastifyVue from '@fastify/vue/plugin'

export default {
  plugins: [
    // ...
    viteFastifyVue({
      defaultLocale: 'en',
      localePrefix: false,
      localeDomains: { 'sv': 'example.se', 'da': 'example.dk' }
    }),
  ]
}
```

In your Vue template file:  

```vue
<script>
// Define routes that aren't the default locale (en)
export const i18n = {
  'sv': '/product',
  'da': '/product',
}
</script>
```

Routes will be identified by domain `en: */product`, `se: example.se/product` and `da: example.dk/product`.

## Dynamic parameters

Dynamic route parameters uses `[param]` for a singular parameter and `[param+]` for wildcard routes.

## Scroll behavior

Scroll behavior can be set by exporting the function `scrollBehavior` in `root.vue`. See [Scroll Behavior](https://router.vuejs.org/guide/advanced/scroll-behavior) on how to use it.

In your `root.vue` file:  

```js
export function scrollBehavior() {
  // Always scroll to the top
  return { top: 0, left: 0 };
}
```

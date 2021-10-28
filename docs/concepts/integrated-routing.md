
# Integrated Routing

You can set routes directly from Vue view files, just export `path`:

<table class="infotable">
<tr>
<td style="width: 20%">
<div class="language-"><pre><code>
├─ entry/
│  ├─ client.js
│  └─ server.js
├─ views/
│  ├─ <b style="color: #ec6f2d">index.vue</b>
│  └─ about.vue
├─ index.html
├─ base.vue
├─ routes.js
├─ main.js
└─ server.js
</code></pre></div>
</td>
<td>

```vue

<template>
  <h1>Index Page</h1>
</template>

<script>
export const path = '/'
</script>
```

</td>
</tr>
</table>

As long as you also use the `loadRoutes()` helper from <b>fastify-vite-vue/app</b>:

<table class="infotable">
<tr>
<td style="width: 20%">
<div class="language-"><pre><code>
├─ entry/
│  ├─ client.js
│  └─ server.js
├─ views/
│  ├─ index.vue
│  └─ about.vue
├─ index.html
├─ base.vue
├─ <b style="color: #ec6f2d">routes.js</b>
├─ main.js
└─ server.js
</code></pre></div>
</td>
<td>

```js

import { loadRoutes } from 'fastify-vite-vue/app'

export default loadRoutes(import.meta.globEager('./views/*.vue'))
```

</td>
</tr>
</table>

The following snippet is equivalent to the one above:

<table class="infotable">
<tr>
<td style="width: 20%">
<div class="language-"><pre><code>
├─ entry/
│  ├─ client.js
│  └─ server.js
├─ views/
│  ├─ index.vue
│  └─ about.vue
├─ index.html
├─ base.vue
├─ <b style="color: #ec6f2d">routes.js</b>
├─ main.js
└─ server.js
</code></pre></div>
</td>
<td>

```js

import Index from './views/index.vue'
import About from './views/about.vue'

export default [
  {
    path: '/',
    component: Index,
  },
  {
    path: '/about',
    component: About,
  },
]
```

</td>
</tr>
</table>


Similarly to the way `createRenderFunction()` works, providing a `routes` array in your server entry export is what ensures you can have individual Fastify [route hooks](/guide/route-hooks.html), [payloads](#route-payloads) and [isomorphic data](#isomorphic-data) functions for each of your [Vue Router][vue-router] routes. When these are exported directly from your view files, `loadRoutes()` ensures they're collected. 

<b>fastify-vite</b> will use this array to automatically <b>register one individual route</b> for them while applying any hooks and data functions provided.

[vue-router]: https://router.vuejs.org/

::: tip
<b>If you don't export</b> `routes`, you have to tell Fastify what routes you want rendering your SSR application:

```js
fastify.vite.get('/*')
```

And in this case, any <b>_hooks_</b> or <b>_data functions_</b> exported directly from your Vue files <b>would be ignored</b>.
:::



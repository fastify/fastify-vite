
## Integrated Routing

It's important to understand there's routing at the Fastify level, a [highly efficient one](https://github.com/delvedor/find-my-way), and routing at the client application level ([Vue Router](https://next.router.vuejs.org/), [React Router](https://reactrouter.com/) etc).

In order to ensure there can be individual route hooks for each client route, the default behavior of <b>fastify-vite</b> is to register an individual Fastify route for each of your client routes. It does so by looking for a `routes` export in the server entry point for the Vite application.

::: tip
In the original SSR examples from Vite's playground, the server entry point only exports the rendering function, not the routes.
:::

By default, <b>fastify-vite</b> will automatically load all `.vue` files from the `<root>/views` directory, and to determine what route they're associated to, it expects to find a `path` export. 

::: tip
The terms **view** and **route** seem interchangeable for <b>fastify-vite</b> applications, but a single view can be mapped to multiple routes at once, just make the `path` export an array of strings. 

You can also [opt out]() of the default routing behavior — see more in [Project Blueprint]().
:::

If you create `views/foobar.vue` as follows:

```vue
<script>
export const path = '/'
</script>

<template>
  <h1>Hello World</h1>
</template>
```

It doesn't matter this file is called `foobar.vue`, it will be used to render the `/` route. 

::: tip
This differs from the default `pages/` folder behavior from Nuxt.js and Next.js, where the structure of the folder and filenames are used to generate the routes themselves. You can still use [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages) to have the same behavior in your <b>fastify-vite</b> vite apps if you want.
:::


As long as you also use the `loadRoutes()` helper from <b>fastify-vite-vue/app</b>:

```js

import { loadRoutes } from 'fastify-vite-vue/app'

export default loadRoutes(import.meta.globEager('./views/*.vue'))
```

The following snippet is equivalent to the one above:

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

## Route Hooks

<b>fastify-vite</b> lets you define Fastify [route-level hooks](https://www.fastify.io/docs/latest/Hooks/#requestreply-hooks) directly in your <b>view files</b>, as long as you use the `loadRoutes()` method provided by your chosen renderer adapter. 

Below is a quick rundown of all Fastify route-level hooks available:

<table class="infotable">
<tr style="width: 100%">
<td style="width: 20%">
<strong>Fastify Hooks</strong>
<br><br><b>Route Level</b>
</td>
<td class="code-h" style="width: 80%">
<code class="h inline-block">onRequest</code>
—— Executed as soon as a new request comes in
<br><br>
<code class="h inline-block">preParsing</code>
—— Receives stream with the current request raw body payload
<br><br>
<code class="h inline-block">preValidation</code>
—— Allows changing req.body prior to validation
<br><br>
<code class="h inline-block">preHandler</code>
—— Executed before the associated route handler
<br><br>
<code class="h inline-block">preSerialization</code>
—— Allows changing response body prior to serialization
<br><br>
<code class="h inline-block">onError</code>
—— Executed when there's an error 
<br><br>
<code class="h inline-block">onSend</code>
—— Allows changing the serialized response body
<br><br>
<code class="h inline-block">onResponse</code>
—— Executed after the response has been sent
<br><br>
<code class="h inline-block">onTimeout</code>
—— Executed when there's a timeout (if you set <code>connectionTimeout</code>)
</td>
</tr>
</table>

<br>

The following examples for Vue and React demonstrate how to leverage automatic [client hydration](/internals/client-hydration) for `req.$data` —— that is made available on the client as `ctx.$data` via `useHydration()` —— from Fastify's `onRequest` route hook. To make it absolutely crystal clear:

<table class="infotable">
<tr style="width: 100%">
<td style="width: 20%">
<strong>Execution Order</strong>
<br><br><b>onRequest data client hydration example</b>
</td>
<td class="code-h" style="width: 80%">
<span class="h inline-block"><b>1.</b> <code>onRequest</code> hook runs on the server, <code>req.$data</code> gets populated</span>
<br><br>
<span class="h inline-block"><b>2.</b> <b>fastify-vite</b>'s <code>getHydrationScript()</code> is called from handler</span>
<br><br>
<span class="h inline-block"><b>3.</b> Hydration takes place on client entry point with <code>hydrate()</code></span>
<br><br>
<span class="h inline-block"><b>4.</b> Hydrated data available via <code>useHydration()</code> on Vue or React view</span>
</td>
</tr>
</table>

::: tip
Bear in mind `ctx.$data` would no longer be populated following client-side navigation (History API) in these examples. For this you need to ensure data can be retrieved from the client as well. Route Hooks work best to power first render specific tasks before Route Payloads and Isomorphic Data.
:::

## Vue

```vue
<template>
  <h2>Registering Fastify route hooks via exports</h2>
  <p>{{ ctx.$data ? ctx.$data.msg : 'Refresh (SSR) to get server data' }}</p>
</template>

<script>
import { useHydration, isServer } from 'fastify-vite-vue/client'

export const path = '/route-hooks'

export async function onRequest (req) {
  req.$data = { msg: 'hello from onRequest' }
}

export default {
  async setup () {
    const ctx = await useHydration()
    return { ctx }
  }
}
</script>

```

## React

```jsx
import { useHydration } from 'fastify-vite-react/client'

export const path = '/route-hooks'

export async function onRequest (req) {
  req.$data = { msg: 'hello from onRequest' }
}

export default function RouteHooks () {
  const [ctx] = useHydration()

  return (
    <>
      <h2>Registering Fastify route hooks via exports</h2>
      <p>{ ctx.$data ? ctx.$data.msg : 'Refresh (SSR) to get server data' }</p>
    </>
  )
}
```

## Manual

Alternatively, you can manually pass them to your Fastify route definitions:

```js
fastify.vite.get('/*', {
  onRequest (req, reply, done) {
    done()
  }
})
```

Or via the `routes` array exported in the server entry point.

---
sidebarDepth: 3
---

# Using Vue

::: tip
This section is intentionally kept in sync with [Using React](/guide/react.html) (and any other future framework usage guides), because one of <b>fastify-vite</b>'s goals is to provide the very same usage API no matter what framework you use.
:::

## Quick Start

First make sure you have `degit`, a CLI to [scaffold directories pulling from Git][degit]:

[degit]: https://github.com/Rich-Harris/degit

<code>npm i degit -g</code>

Then you can start off with <b>fastify-vite</b>'s base Vue 3 starter or any of the others available:

<code>degit terixjs/flavors/vue-base <b>your-app</b></code>

::: tip
[terixjs/flavors](https://github.com/terixjs/flavors) is a mirror to the `examples/` folder from <b>fastify-vite</b>, kept as a convenience for shorter `degit` calls.
:::

After that you should be able to `cd` to `your-app` and run:

<code>npm install</code> — will install <code>fastify</code>, <code>vite</code>, <code>fastify-vite</code> etc from <code>package.json</code>

<code>npm run dev</code> — for running your app with Fastify + Vite's development server

<code>npm run build</code> — for [building](/guide/deployment.html) your Vite application

<code>npm run start</code> — for serving in production mode

## Project Structure

Some conventions are used in the official boilerplates, but they are easy to override and defined mostly by renderer adapters. For instance, <b>fastify-vite-vue</b> expects the client entry point to be located at `entry/client.js` while <b>fastify-vite-react</b> expects the client entry point to be located at `entry/client.jsx`.

A <b>fastify-vite</b> project will have _at the very least_ a) a `server.js` file launching the Fastify server, b) an `index.html` file and c) <b>client</b> and <b>server</b> entry points for the Vite application.

<b>fastify-vite</b>'s 
[base Vue 3+ starter boilerplate](https://github.com/terixjs/fastify-vite/tree/main/examples/vue-base) is based on the [official Vue 3 SSR example][ssr-vue] from Vite's [playground][playground]. For simplicity, the client source code is kept at the same level as `server.js`, but if you set the `root` option for <b>fastify-vite</b> you could easily move it all to a `client/` folder. In a big project with multiple folders and files for both client and server code, you'll want to do this.

The differences from the official Vite example start with `server.js`, where the [raw original _Express_-based example][vue-server.js] is replaced with the following Fastify server initialization boilerplate:

[vue-server.js]: https://github.com/vitejs/vite/blob/main/packages/playground/ssr-vue/server.js
[ssr-vue]: https://github.com/vitejs/vite/tree/main/packages/playground/ssr-vue
[playground]: https://github.com/vitejs/vite/tree/main/packages/playground

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
├─ routes.js
├─ main.js
└─ <b style="color: #ec6f2d">server.js</b>
</code></pre></div>
</td>
<td>

```js

const fastify = require('fastify')
const fastifyVite = require('fastify-vite')
const fastifyViteVue = require('fastify-vite-vue')

async function main () {
  const app = fastify()
  await app.register(fastifyVite, {
    root: __dirname,
    renderer: fastifyViteVue,
    build: process.argv.includes('build'),
  })
  return app
}

if (require.main === module) {
  main().then((app) => {
    app.listen(3000, (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Server listening on ${address}`)
    })
  })
}

module.exports = main
```

</td>
</tr>
</table>

You may notice instantly `main()` doesn't call `app.listen()` directly. This is an established <b>_idiom_</b> to facilitate <b>testing</b>, that is, having a function that returns the preconfigured Fastify instance.

Notice how we also pass in `build` flag, based on the presence of a `build` command line argument. If `build` is `true`, running the following command would then <b>trigger the Vite build</b> for your app instead of booting the server, as it'll force `process.exit()` when the build is done:

<code style="font-size: 1.2em">$ node server.js build</code>

::: tip
This mimics the behavior of [vite build](https://vitejs.dev/guide/build.html), calling Vite's internal `build()` function and will take into consideration options defined in a `vite.config.js` file or provided via the `vite` plugin option.
:::

## Entry Points 

The next differences from Vite's official Vue 3 SSR example are the <b>server</b> and <b>client</b> entry points.

For the <b>server</b> entry point, instead of providing only a `render` function, with <b>fastify-vite</b> you can also provide a `routes` array. The `render` function itself should be created with the factory function provided by <b>fastify-vite-vue</b>, `createRenderFunction()`, which will automate things like [client hydration](/internals/client-hydration.html) and add support for [route hooks](/guide/route-hooks.html), [payloads](#route-payloads) and [isomorphic data fetching](#isomorphic-data).

[server-entry-point]: https://github.com/vitejs/vite/blob/main/packages/playground/ssr-vue/src/entry-server.js 

<table class="infotable">
<tr>
<td style="width: 20%">
<div class="language-"><pre><code>
├─ <b style="color: #ec6f2d">entry/</b>
│  ├─ client.js
│  └─ <b style="color: #ec6f2d">server.js</b>
├─ views/
│  ├─ index.vue
│  └─ about.vue
├─ index.html
├─ base.vue
├─ routes.js
├─ main.js
└─ server.js
</code></pre></div>
</td>
<td>

```js

import { createApp } from '../main'
import { createRenderFunction } from 'fastify-vite-vue/server'
import routes from '../routes'

export default {
  routes,
  render: createRenderFunction(createApp),
}
```

</td>
</tr>
</table>

For the <b>client</b> entry point, things are nearly exact the same as [the original example][client-entry-point], the only addition being the `hydrate()` import and call seen in the snippet below. 

[client-entry-point]: https://github.com/vitejs/vite/blob/main/packages/playground/ssr-vue/src/entry-client.js 

<table class="infotable">
<tr>
<td style="width: 20%">
<div class="language-"><pre><code>
├─ <b style="color: #ec6f2d">entry/</b>
│  ├─ <b style="color: #ec6f2d">client.js</b>
│  └─ server.js
├─ views/
│  ├─ index.vue
│  └─ about.vue
├─ index.html
├─ base.vue
├─ routes.js
├─ main.js
└─ server.js
</code></pre></div>
</td>
<td>

```js

import { createApp } from '../main'
import { hydrate } from 'fastify-vite-vue/client'
const { app, router } = createApp()

hydrate(app)

// Wait until router is ready before 
// mounting to ensure hydration match
router.isReady().then(() => app.mount('#app'))
```

</td>
</tr>
</table>

This will pick up values serialized in `window` during SSR (like `window.__NUXT__`) and make sure they're available through `useHydration()`, <b>fastify-vite</b>'s unified helper for dealing with isomorphic data. See more in <b>[Client Hydration](/internals/client-hydration.html)</b>, <b>[Route Payloads](#route-payloads)</b> and <b>[Isomorphic Data](#isomorphic-data)</b>. 

## Routing Setup

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

## Data Fetching

<b>fastify-vite</b> prepacks two different **_convenience mechanisms_** for fetching data before and after initial page load. Those are in essence just two different <b>data functions</b> you can export from your view files.

One is for when your data function can only run on the server but still needs to be accessible from the client via an HTTP API call, the other is for when your data function needs to be fully isomorphic, that is, run both on server and client exactly the same way.

### Route Payloads

[async-data]: https://nuxtjs.org/examples/data-fetching-async-data
[prepass]: https://github.com/FormidableLabs/react-ssr-prepass
[preHandler]: https://www.fastify.io/docs/latest/Hooks/#prehandler

The first is `getPayload`, which is in a way very similar to `getServerSideProps` [in Next.js](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering), with a dash of [react-ssr-prepass][prepass]. Exporting a `getPayload` function from a view will **automatically cause it to be called <b>prior to SSR</b> (still in the Fastify layer) when rendering the route it's associated to**, but will **also automatically register an endpoint where you can call it from the client**. Not only that, coupled with <b>fastify-vite</b>'s [`useHydration`](/functions/use-hydration) isomorphic hook, `getPayload` will stay working seamlessly during client-side navigation ([History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) via [Vue Router](https://next.router.vuejs.org/), [React Router](https://reactrouter.com/) etc). In that regard it's very similar to `asyncData` Nuxt.js, which will also work seamlessly during SSR and client-side navigation.

In a nutshell — navigating to a route on the client will cause an HTTP request to be triggered automatically for that route's payload data. If the route is being server-side rendered, data is retrieved on the server and just hydrated on the client on first render.

```js
export const path = '/route-payload'

// Will absolutely only run on the server, so it's safe to
// assume req, reply and fastify references are defined 
// in the context object passed as first parameter
export async function getPayload ({ req, reply, fastify }) {
  // Simulate a long running request
  await new Promise((resolve) => setTimeout(resolve, 3000))

  return {
    message: req.query?.message || 'Hello from server',
  }
}
```

On the server, `getPayload` is set up to run automatically in the route's [`preHandler`][preHandler] hook.

Providing this function will also cause a GET JSON endpoint to be set up to run it remotely. The endpoint URL is generated following the <code>/-/payload/:url</code> format. 

If you're exporting a `getPayload` function from the `/foobar` view component, then the automatically registered endpoint will be `/-/payload/foobar`.

So, to recap — because this can be a little confusing at first — <b>here's the rundown</b>:

- During first-render, on the server, `getPayload` is executed via a [`preHandler`][preHandler] hook.
- Its result is stored as <code>req.$payload</code> and then serialized for [client hydration](/internals/client-hydration). 
- <b>Both on the server and on the client, the value is available via `useHydration` as `$payload`</b>.
- <b>For client-side navigation, <code>useHydration</code> will call the HTTP endpoint automatically</b>.


#### Retrieving payload with useHydration

The `useHydration` hook takes a configuration object as first parameter. The purpose of this configuration object is to easily to hold a reference to the data function being used in the view.

```vue{4-8,12-14}
<script>
export const path = '/route-payload'

export async function getPayload ({ req, reply, fastify }) {
  // ...
  // Omitted for brevity
  // ...
}

export default {
  setup () {
    // Pass getPayload reference to useHydration() so 
    // it knows that's what is being used for this component
    const { $payload } = useHydration({ getPayload })
    return { message: $payload.message }
  }
}
</script>
```

`useHydration` doesn't really do anything with the `getPayload`, **it just uses it to know what to do**.

If it sees a reference to a function named `getPayload`, it will know `getPayload` is defined in that scope and it should try to retrieve a route payload — either live during SSR, hydrated on the client or retrieved via the automatically created HTTP endpoint.

::: tip
As a convention, special properties associated with data fetching functions have the `$` prefix.
:::

`useHydration` also provides the `$payloadPath` function, to get the HTTP endpoint programatically. In the snippet below, a new request to the page's payload endpoint set up to be performed manually.

It also shows the <b>reactive</b> context object returned by `useHydration` used to manage loading status, in the case where it's triggering a request to the payload HTTP endpoint client-side.

```js
export default {
  setup () {
    const ctx = useHydration({ getPayload })
    const message = ref(null)

    async function refreshPayload () {
      ctx.$loading = true
      const response = await window.fetch(`${
        ctx.$payloadPath()
      }?message=${
        encodeURIComponent('Hello from client')
      }`)
      const json = await response.json()
      message.value = json.message
      ctx.$loading = false
    }
    return { ctx, message, refreshPayload }
  }
}
```

Learn more by playing with the [`vue-data`](https://github.com/terixjs/flavors/tree/main/vue-data) boilerplate flavor:

`degit terixjs/flavors/vue-data your-app`

### Isomorphic Data

The second convenience mechanism is `getData`. It's very similar to `getPayload` as <b>fastify-vite</b> will also run it from the route's [preHandler][preHandler] hook. 

But it resembles the classic [`asyncData`][async-data] from Nuxt.js more closely — because the very same `getData` function gets executed both on the server and on the client (during navigation). If it's executed first on the server, the client gets the [hydrated](/internals/client-hydration) value on first render. 

::: tip
When using `getPayload`, the client is able to execute that very same function, but via a HTTP request to an automatically created endpoint that provides access to it on the server.
:::

Below is a minimal example — like in the previous `getPayload` examples, you must pass a reference to the `getData` function used to `useHydration`.

```vue
<script>
import { fetch } from 'fetch-undici'
import { useHydration, isServer } from 'fastify-vite-vue/client'

export const path = '/data-fetching'

export async function getData ({ req }) {
  const response = await fetch('https://httpbin.org/json')
  return {
    message: isServer
      ? req.query?.message ?? 'Hello from server'
      : 'Hello from client',
    result: await response.json(),
  }
}

export default {
  async setup () {
    const { $data } = await useHydration({ getData })
    return { message: $data.message }
  }
}
</script>
```

Notice how this example uses [fetch-undici](https://www.npmjs.com/package/fetch-undici) to provide isomorphic access to [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

To recap:

- During first-render, on the server, `getData` is executed via a [`preHandler`][preHandler] hook.
- Its result is stored as <code>req.$data</code> and then serialized for [client hydration](/internals/client-hydration). 
- <b>Both on the server and on the client, the value is available via `useHydration` as `$data`</b>.
- <b>For client-side navigation, <code>useHydration</code> executes the `getData` function isomorphically</b>.


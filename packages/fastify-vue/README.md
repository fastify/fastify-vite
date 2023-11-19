<br>

# @fastify/vue [![NPM version](https://img.shields.io/npm/v/@fastify/vue.svg?style=flat)](https://www.npmjs.com/package/@fastify/vue) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

**Fastify DX for Vue** (**`@fastify/vue`**) is a renderer for [**@fastify/vite**](https://github.com/fastify/fastify-vite).

It lets you run and SSR (server-side render) **Vue 3 applications built with Vite** on [Fastify](https://fastify.io/), with a minimal and transparent **server-first approach** — where everything starts with `server.js`, your actual Fastify server.

It has an extremely small core (~1k LOC total) and is built on top of [Fastify](https://github.com/fastify/fastify), [Vite](https://vitejs.dev/) and [Vue Router](https://router.vuejs.org/).

## Quick Start

Ensure you have **Node v16+**.

Make a copy of [**starters/vue**](https://github.com/fastify/fastify-dx/tree/dev/starters/vue). If you have [`degit`](https://github.com/Rich-Harris/degit), run the following from a new directory:

```bash
degit fastify/fastify-dx/starters/vue
```

> **If you're starting a project from scratch**, you'll need these packages installed.
>
> ```bash
> npm i fastify @fastify/vite @fastify/vue -P
> npm i @vitejs/plugin-vue -D
> ```


Run `npm install -f`. 
  
Run `npm run dev`. 

Visit `http://localhost:3000/`.

## What's Included

That will get you a **starter template** with:
  
- A minimal [Fastify](https://github.com/fastify/fastify) server.
- Some dummy API routes.
- A `pages/` folder with some [demo routes](https://github.com/fastify/fastify-dx/tree/dev/starters/vue/client/pages).
- All configuration files.

It also includes some _**opinionated**_ essentials:

- [**PostCSS Preset Env**](https://www.npmjs.com/package/postcss-preset-env) by [**Jonathan Neal**](https://github.com/jonathantneal), which enables [several modern CSS features](https://preset-env.cssdb.org/), such as [**CSS Nesting**](https://www.w3.org/TR/css-nesting-1/).

- [**UnoCSS**](https://github.com/unocss/unocss) by [**Anthony Fu**](https://antfu.me/), which supports all [Tailwind utilities](https://uno.antfu.me/) and many other goodies through its [default preset](https://github.com/unocss/unocss/tree/main/packages/preset-uno). 

- [**VueUse**](https://vueuse.org/) by [**Anthony Fu**](https://antfu.me/), which provides an extremely rich set of utilities — they're not included in the project build unless explicitly imported and used.

## Package Scripts

`npm run dev` boots the development server.
  
`npm run build` creates the production bundle.
  
`npm run serve` serves the production bundle.


## Basic setup

The [starter template](https://github.com/fastify/fastify-dx/tree/dev/starters/vue) follows [@fastify/vite](https://github.com/fastify/fastify-vite)'s convention of having a `client` folder with an `index.js` file, which is automatically resolved as your `clientModule` setting. 

If you want flat directory setup, where server and client files are mixed together, you can manually set `clientModule` to something else. Note that in this case you'll also need to update `root` in your `vite.config.js` file.

When deploying to production, bear in mind the `client/dist` directory, generated when you run `npm run build`, needs to be included. You'll also want to enable Fastify's [built-in logging](https://www.fastify.io/docs/latest/Reference/Logging/):

```js
const server = Fastify({ logger: true })
```

The starter template's `server.js` file:

```js
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import FastifyVue from '@fastify/vue'

const server = Fastify()

await server.register(FastifyVite, { 
  root: import.meta.url, 
  renderer: FastifyVue,
})

await server.vite.ready()
await server.listen(3000)
```

The starter template's [`vite.config.js`](https://github.com/fastify/fastify-dx/blob/main/starters/vue/vite.config.js) file:

```js
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import viteVue from '@vitejs/plugin-vue'
import viteVueFastifyDX from '@fastify/vue/plugin'
import unocss from 'unocss/vite'

const path = fileURLToPath(import.meta.url)

const root = join(dirname(path), 'client')
const plugins = [
  viteVue(), 
  viteVueFastifyDX(), 
  unocss()
]

export default { root, plugins }
```

Note that you only need to use Fastify DX's Vite plugin, which includes all functionality from [@fastify/vite](https://github.com/fastify/fastify-vite)'s Vite plugin.

</td>
</tr>
</table>


## Project Structure

The [starter template](https://github.com/fastify/fastify-dx/tree/dev/starters/vue) looks like this:

```
├── server.js
├── client/
│    ├── index.js
│    ├── context.js
│    ├── root.vue
│    ├── index.html
│    ├── layouts/
│    │    ├── default.vue
│    │    └── auth.vue
│    └── pages/
│          ├── index.vue
│          ├── client-only.vue
│          ├── server-only.vue
│          ├── streaming.vue
│          ├── using-data.vue
│          └── using-store.vue
├── vite.config.js
└── package.json
```
  
Several internal files are provided as virtual modules by Fastify DX. They are located inside the `@fastify/vue` package in `node_modules`, and dynamically loaded so you don't have to worry about them unless you want them overriden. 

In this case, placing a file with the same name as the registered virtual module in your Vite project root will override it. Find the detailed rundown of all virtual modules [here][virtual-modules].

[virtual-modules]: https://github.com/fastify/fastify-dx/blob/main/docs/vue/virtual-modules.md

The `server.js` file is your application entry point. It's the file that runs everything. It boots a Fastify server configured with [**fastify-vite**](https://github.com/fastify/fastify-vite) and **Fastify DX for Vue** as a renderer adapter to **fastify-vite**. 

The `client/index.js` file is your Vite server entry point, it's the file that provides your client bundle (which runs in the Vite-enriched environment) to the Node.js environment where Fastify runs. 

> Right now, it's mostly a **boilerplate file** because it must exist but it will also probably never need to be changed.

It exports your application's factory function (must be named `create`), the application routes (must be named `routes`) and the universal route context [initialization module](https://github.com/fastify/fastify-dx/blob/main/docs/vue/route-context.md#initialization-module) (must be named `context` and have a dynamic module import so Fastify DX can pick up `default` and named exports).

The `client/index.html` file is the [root HTML template of the application](https://vitejs.dev/guide/#index-html-and-project-root), which Vite uses as the client bundling entry point. 

> You can expand this file with additional `<meta>` and `<link>` tags if you wish, provided you don't remove any of the placeholders. 

This files links to `/dx:mount.js`, which is a virtual module provided by Fastify DX. 

Virtual modules are covered [here][virtual-modules].
  
The `client/pages/` directory contains your route modules, whose paths are dynamically inferred from the directory structure itself. You can change this behavior easily. More on this [here][routing-config].

[routing-config]: https://github.com/fastify/fastify-dx/blob/main/docs/vue/routing-config.md

The `client/layouts/` directory contains your route layout modules, which can be associated to any route. By default, `layouts/default.vue` is used, but if you don't need to do any modifications on that file, you can safely removed as it's provided by Fastify DX in that case. The starter template also comes with `layouts/auth.vue`, to demonstrate a more advanced use of layouts.

[routing-config]: https://github.com/fastify/fastify-dx/blob/main/docs/vue/routing-config.md

The `client/context.js` file is the universal [route context][route-context] initialization module. Any named exports from this file are attached to the `RouteContext` class prototype on the server, preventing them from being reassigned on every request. The `default` export from this file, however, runs for every request so you can attach any request-specific data to it.

[route-context]: https://github.com/fastify/fastify-dx/blob/main/docs/vue/route-context.md


# Rendering modes

Following the [URMA specification](https://github.com/fastify/fastify-dx/blob/main/URMA.md), Fastify DX's route modules can be set for universal rendering (SSR + CSR hydration, the default behavior), SSR in streaming mode, SSR only (client gets no JavaScript) or CSR only (SSR fully disabled).

## `streaming`

If a route module exports `streaming` set to `true`, SSR will take place in **streaming mode**. That means the result of all server-side rendering gets streamed as it takes place, even if you have asynchronous Vue components. Note that differently from React, Vue **will not** stream a Suspense block's `#fallback` template.

```vue
<template>
  <Message :secs="2" />
  <Message :secs="4" />
  <Message :secs="6" />
</template>

<script>
import Message from '/components/Message.vue'

export const streaming = true

export default {
  components: { Message },
}
</script>
```

[See the full example](https://github.com/fastify/fastify-dx/blob/main/starters/vue/client/pages/streaming.vue) in the [starter template](https://github.com/fastify/fastify-dx/tree/dev/starters/vue).


## `serverOnly`

If a route module exports `serverOnly` set to `true`, only SSR will take place. The client gets the server-side rendered markup without any accompanying JavaScript or data hydration.

You should use this setting to deliver lighter pages when there's no need to run any code on them, such as statically generated content sites.

```vue
<template>
  <p>This route is rendered on the server only!</p>
</template>

<script>
export const serverOnly = true
</script>
```

[This example](https://github.com/fastify/fastify-dx/blob/main/starters/vue/client/pages/server-only.vue) is part of the [starter template](https://github.com/fastify/fastify-dx/tree/dev/starters/vue).

## `clientOnly`

If a route module exports `clientOnly` set to `true`, no SSR will take place, only data fetching and data hydration. The client gets the empty container element (the one that wraps `<!-- element -->` in `index.html`) and all rendering takes place on the client only.

You can use this setting to save server resources on internal pages where SSR makes no significant diference for search engines or UX in general, such as a password-protected admin section.

```vue
<template>
  <p>This route is rendered on the client only!</p>
</template>

<script>
export const clientOnly = true
</script>
```

[This example](https://github.com/fastify/fastify-dx/blob/main/starters/vue/client/pages/client-only.vue) is part of the [starter template](https://github.com/fastify/fastify-dx/tree/dev/starters/vue).


## Routing Configuration

By default, routes are loaded from the `<project-root>/pages` folder, where `<project-root>` refers to the `root` setting in `vite.config.js`. The route paths are **dynamically inferred from the directory structure**, very much like Next.js and Nuxt.js.

### Dynamic parameters

Dynamic route parameters follow the [Next.js convention](https://nextjs.org/docs/basic-features/pages#pages-with-dynamic-routes) (`[param]`), but that can be overriden by using the `paramPattern` plugin option. For example, this configuration switches the param pattern to the [Remix convention](https://remix.run/docs/en/v1/guides/routing#dynamic-segments) (`$param`).

```js
// ...
const plugins = [
  // ...
  viteVueFastifyDX({ paramPattern: /\$(\w+)/ }),
]
```

### Routes location

You can also change the glob pattern used to determine where to route modules from. 

Since this setting is passed to [Vite's glob importers](https://vitejs.dev/guide/features.html#glob-import), the value needs to be a string:

```js
// ...
const plugins = [
  // ...
  viteVueFastifyDX({ globPattern: '/views/**/*.vue' }),
]
```

### View modules

You also can export a `path` constant from your route modules, in which case its value will be used to **override the dynamically inferred paths from the directory structure**. 

Additionally, [**you can provide your own routes**](https://github.com/fastify/fastify-dx/tree/dev/packages/fastify-vue#dxroutesjs).

```jsx
<template>
  <p>Route with path export</p>
</template>

<script>
export const path = '/my-page'
</script>
```


## Isomorphic data prefetching

Fastify DX for Vue implements the `getData()` hook from the [URMA specification](https://github.com/fastify/fastify-dx/blob/main/URMA.md) to solve this problem.

### `getData(ctx)`

This hook is set up in a way that it runs server-side before any SSR takes place, so any data fetched is made available to the route component before it starts rendering. During first render, any data retrieved on the server is automatically sent to be hydrated on the client so no new requests are made. Then, during client-side navigation (post first-render), a JSON request is fired to an endpoint automatically registered for running the `getData()` function for that route on the server.

The objet returned by `getData()` gets automatically assigned as `data` in the [universal route context](https://github.com/fastify/fastify-dx/blob/main/docs/vue/route-context.md) object and is accessible from `getMeta()` and `onEnter()` hooks and also via the `useRouteContext()` hook.

```vue
<template>
  <p>{data.message}</p>
</template>

<script>
import { useRouteContext } from '/dx:core.js'

export function getData (ctx) {
  return {
    message: 'Hello from getData!',
  }
}

export default {
  setup () {
    const { data } = useRouteContext()
    return { data }
  }
}
</script>
```

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


## Universal Route Enter Event

### `onEnter(ctx)`

If a route module exports a `onEnter()` function, it's executed before the route renders, both in SSR and client-side navigation. That is, the first time a route render on the server, onEnter() runs on the server. Then, since it already ran on the server, it doesn't run again on the client for that first route. But if you navigate to another route on the client using `<Link>`, it runs normally as you'd expect.

It receives the [universal route context][route-context] as first parameter, so you can make changes to `data`, `meta` and `state` if needed.

[route-context]: https://github.com/fastify/fastify-dx/blob/main/docs/vue/route-context.md

```html
<template>
  <p>No pre-rendered HTML sent to the browser.</p>
</template>

<script>
export function onEnter (ctx) {
  if (ctx.server?.underPressure) {
    ctx.clientOnly = true
  }
}
</script>
```

The example demonstrates how to turn off SSR and downgrade to CSR-only, assuming you have a `pressureHandler` configured in [`underpressure`](https://github.com/fastify/under-pressure) to set a `underPressure` flag on your server instance.


## Meta Tags

Following the [URMA specification](https://github.com/fastify/fastify-dx/blob/main/URMA.md), Fastify DX renders `<head>` elements independently from the SSR phase. This allows you to fetch data for populating the first `<meta>` tags and stream them right away to the client, and only then perform SSR.

> Additional `<link>` preload tags can be produced from the SSR phase. This is **not currently implemented** in this **alpha release** but is a planned feature. If you can't wait for it, you can roll out your own (and perhaps contribute your solution) by providing your own [`createHtmlFunction()`](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-vue/index.js#L57) to [@fastify/vite](https://github.com/fastify/fastify-vite).

### `getMeta()`

To populate `<title>`, `<meta>` and `<link>` elements, export a `getMeta()` function that returns an object matching the format expected by [unihead](https://github.com/galvez/unihead), the underlying library used by Fastify DX.
  
It receives the [route context](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-vue/README.md#route-context) as first parameter and runs after `getData()`, allowing you to access any `data` populated by these other functions to generate your tags.

```vue
<template>
  <p>Route with meta tags.</p>
</template>

<script>
export function getMeta (ctx) {
  return {
    title: 'Route Title',
    meta: [
      { name: 'twitter:title', value: 'Route Title' },
    ]
  }
}
</script>
```


## Virtual Modules

**Fastify DX** relies on [virtual modules](https://github.com/rollup/plugins/tree/master/packages/virtual) to save your project from having too many boilerplate files. Virtual modules are a [Rollup](https://rollupjs.org/guide/en/) feature exposed and fully supported by [Vite](https://vitejs.dev/). When you see imports that start with `/dx:`, you know a Fastify DX virtual module is being used.

Fastify DX virtual modules are **fully ejectable**. For instance, the starter template relies on the `/dx:root.vue` virtual module to provide the Vue shell of your application. If you copy the `root.vue` file [from the @fastify/vue package](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-vue/virtual/root.vue) and place it your Vite project root, **that copy of the file is used instead**. In fact, the starter template already comes with a custom `root.vue` of its own to include UnoCSS.

Aside from `root.vue`, the starter template comes with two other virtual modules already ejected and part of the local project — `context.js` and `layouts/default.vue`. If you don't need to customize them, you can safely removed them from your project.

### `/dx:root.vue`

This is the root Vue component. It's used internally by `/dx:create.js` and provided as part of the starter template. You can use this file to add a common layout to all routes, and also to extend your Vue app by exporting a `configure()` function. For example, Fastify DX for Vue comes with a SSR-safe, global state based on a simple `reactive()` object — but if you want to use Pinia, you could set it up as follows:

```js
import { createPinia } from 'pinia'

export function configure (app) {
  const pinia = createPinia()
  app.use(pinia)
}
```

> Alternatively, you could eject the full `create.js` virtual module where `app` is fully defined.

The version provided as part of the starter template includes [UnoCSS](https://github.com/unocss/unocss)'s own virtual module import, necessary to enable its CSS engine.

```vue
<script>
import 'uno.css'
</script>

<script setup>
import Layout from '/dx:layout.vue'
</script>

<template>
  <router-view v-slot="{ Component }">
    <Suspense>
      <Layout>
        <component
          :is="Component"
          :key="$route.path"
        />
      </Layout>
    </Suspense>
  </router-view>
</template>

```

Note that a top-level `<Suspense>` wrapper is necessary because Fastify DX has code-splitting enabled at the route-level. You can opt out of code-splitting by providing your own `routes.js` file, but that's very unlikely to be ever required for any reason.

### `/dx:routes.js`

Fastify DX has **code-splitting** out of the box. It does that by eagerly loading all route data on the server, and then hydrating any missing metadata on the client. That's why the routes module default export is conditioned to `import.meta.env.SSR`, and different helper functions are called for each rendering environment.

```js
export default import.meta.env.SSR
  ? createRoutes(import.meta.globEager('$globPattern'))
  : hydrateRoutes(import.meta.glob('$globPattern'))
```

See [the full file](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-vue/virtual/routes.js) for the `createRoutes()` and `hydrateRoutes()` definitions. 

If you want to use your own custom routes list, you must eject this file as-is and replace the glob imports with your own routes list:

```js
const routes = [
  { 
    path: '/', 
    component: () => import('/custom/index.vue'),
  }
]

export default import.meta.env.SSR
  ? createRoutes(routes)
  : hydrateRoutes(routes)
````

### `/dx:core.js`

Implements `useRouteContext()` and `createBeforeEachHandler()`, used by `core.js`.

`DXApp` is imported by `root.vue` and encapsulates Fastify DX's route component API.

> Vue Router's [nested routes](https://router.vuejs.org/guide/essentials/nested-routes.html) aren't supported yet.

See its full definition [here](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-vue/virtual/core.js).

### `/dx:create.js`

This virtual module creates your root Vue component. 

This is where `root.vue` is imported.

<b>You'll rarely need to customize this file.</b>

```js
import { createApp, createSSRApp, reactive, ref } from 'vue'
import { createRouter } from 'vue-router'
import {
  isServer,
  createHistory,
  serverRouteContext,
  routeLayout,
  createBeforeEachHandler,
} from '/dx:core.js'
import root from '/dx:root.vue'

export default async function create (ctx) {
  const { routes, ctxHydration } = ctx

  const instance = ctxHydration.clientOnly
    ? createApp(root)
    : createSSRApp(root)

  const history = createHistory()
  const router = createRouter({ history, routes })
  const layoutRef = ref(ctxHydration.layout ?? 'default')

  instance.provide(routeLayout, layoutRef)
  ctxHydration.state = reactive(ctxHydration.state)

  if (isServer) {
    instance.provide(serverRouteContext, ctxHydration)
  } else {
    router.beforeEach(createBeforeEachHandler(ctx, layoutRef))
  }

  instance.use(router)

  if (ctx.url) {
    router.push(ctx.url)
    await router.isReady()
  }

  return { instance, ctx, router }
}
```

What you see above is its [full definition](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-vue/virtual/create.js).

### `/dx:layout.vue`

This is responsible for loading **layout components**. It's part of `root.vue` by default. If a project has no `layouts/default.vue` file, the default one from Fastify DX is used. This virtual module works in conjunction with the `/dx:layouts/` virtual module which provides exports from the `/layouts` folder.

<b>You'll rarely need to customize this file.</b>

```vue
<template>
  <component :is="layout">
    <slot />
  </component>
</template>

<script>
import { defineAsyncComponent, inject } from 'vue'
import { routeLayout } from '/dx:core.js'

const DefaultLayout = () => import('/dx:layouts/default.vue')
const appLayouts = import.meta.glob('/layouts/*.vue')

appLayouts['/layouts/default.vue'] ??= DefaultLayout

export default {
  setup: () => ({
    layout: inject(routeLayout)
  }),
  components: Object.fromEntries(
    Object.keys(appLayouts).map((path) => {
      const name = path.slice(9, -4)
      return [name, defineAsyncComponent(appLayouts[path])]
    })
  )
}
</script>
```

What you see above is its [full definition](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-vue/virtual/layout.vue).

### `/dx:mount.js`

This is the file `index.html` links to by default. It sets up the application with an `unihead` instance for head management, the initial route context, and provides the conditional mounting logic to defer to CSR-only if `clientOnly` is enabled.

<b>You'll rarely need to customize this file.</b>

[See the full file](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-vue/virtual/mount.js) for the `mount()` function definition.


## Maintainance

Created and maintained by [Jonas Galvez](https://github.com/sponsors/galvez), **Principal Engineer** and **Open Sourcerer** at [NodeSource](https://nodesource.com).

New contributors are extremely welcome to look for [good first issues](https://github.com/fastify/fastify-dx/labels/good%20first%20issue).

## Gold Sponsors

<a href="https://nodesource.com"><img width="200px" src="https://user-images.githubusercontent.com/12291/206885948-3fa742a2-1057-4db2-8648-46f5cb673461.svg"></a>

[Contact me](mailto:jonasgalvez@gmail.com) to add your company's logo here.

## GitHub Sponsors

- [**Duc-Thien Bui**](https://github.com/aecea)
- [**Tom Preston-Werner**](https://github.com/mojombo) 
- [**Clifford Fajardo**](https://github.com/cliffordfajardo)
- [**David Adam Coffey**](https://github.com/dacoffey)
- [**Mezereon**](https://github.com/mezereon-co)
- [**A-J Roos**](https://github.com/Asjas)
- [**James Isaacs**](https://github.com/jamesisaacs2)

[**Click here**](https://github.com/sponsors/galvez) to add your name to this list.

_Thank you!_

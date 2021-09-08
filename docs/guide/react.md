
# Using React

<b>fastify-vite</b>'s 
[base React 17 starter boilerplate](...) is based on the [official React SSR example][ssr-react] from Vite's [playground][playground]. The differences start with `server.js`, where the [raw original _Express_-based example][vue-server.js] can be replaced with the following Fastify server initialization boilerplate:

[react-server.js]: https://github.com/vitejs/vite/blob/main/packages/playground/ssr-react/server.js
[ssr-react]: https://github.com/vitejs/vite/tree/main/packages/playground/ssr-react
[playground]: https://github.com/vitejs/vite/tree/main/packages/playground

<table class="infotable">
<tr>
<td style="width: 20%">
<div class="language-"><pre><code>
├─ entry/
│  ├─ client.jsx
│  └─ server.jsx
├─ views/
│  ├─ index.jsx
│  └─ about.jsx
├─ index.html
├─ base.jsx
├─ routes.js
├─ main.js
└─ <b style="color: #ec6f2d">server.js</b>
</code></pre></div>
</td>
<td>

```js

const fastify = require('fastify')()
const fastifyVite = require('fastify-vite')
const fastifyViteReact = require('fastify-vite-react')

async function main () {
  await fastify.register(fastifyVite, {
    root: __dirname,
    renderer: fastifyViteReact,
  })

  return fastify
}

if (require.main === module) {
  fastifyVite.app(main, (fastify) => {
    fastify.listen(3000, (err, address) => {
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

You may notice instantly `main()` doesn't call `fastify.listen()` directly. This is an established <b>_idiom_</b> to facilitate <b>testing</b>, that is, having a function that returns the preconfigured Fastify instance.

But the reason why it's done in the above snippet is so that it can be used in conjunction with `fastifyVite.app()`, a helper that will make `server.js` respond to a `build` command. Running the following command would then <b>trigger the Vite build</b> for your app instead of booting the server:

<code style="font-size: 1.2em">$ node server.js build</code>

::: tip
This mimics the behavior of [vite build](), calling Vite's internal `build()` function and will take into consideration options defined in a `vite.config.js` file or provided via the `vite` plugin option.
:::

## Entry Points 

The next differences from Vite's official Vue 3 SSR example are the <b>server</b> and <b>client</b> entry points.

For the <b>server</b> entry point, instead of providing only a `render` function, with <b>fastify-vite</b> you can also provide a `routes` array. The `render` function itself should be created with the factory function provided by <b>fastify-vite-react</b>, `createRenderFunction()`, which will automate things like [client hydration]() and add support for [route hooks](), [payloads]() and [isomorphic data fetching]().

[server-entry-point]: https://github.com/vitejs/vite/blob/main/packages/playground/ssr-react/src/entry-server.js 

<table class="infotable">
<tr>
<td style="width: 20%">
<div class="language-"><pre><code>
├─ <b style="color: #ec6f2d">entry/</b>
│  ├─ client.jsx
│  └─ <b style="color: #ec6f2d">server.jsx</b>
├─ views/
│  ├─ index.jsx
│  └─ about.jsx
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
import { createRenderFunction } from 'fastify-vite-react/server'
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

[client-entry-point]: https://github.com/vitejs/vite/blob/main/packages/playground/ssr-react/src/entry-client.js 

<table class="infotable">
<tr>
<td style="width: 20%">
<div class="language-"><pre><code>
├─ <b style="color: #ec6f2d">entry/</b>
│  ├─ <b style="color: #ec6f2d">client.jsx</b>
│  └─ server.jsx
├─ views/
│  ├─ index.jsx
│  └─ about.jsx
├─ index.html
├─ base.vue
├─ routes.js
├─ main.js
└─ server.js
</code></pre></div>
</td>
<td>

```js

import ReactDOM from 'react-dom'
import { ContextProvider, hydrate } from 'fastify-vite-react/client'
import { createApp } from '../main'

const { App, router: Router } = createApp()

ReactDOM.hydrate(
  <Router>
    <ContextProvider context={hydrate()}>
      {App()}
    </ContextProvider>
  </Router>,
  document.getElementById('app'),
)
```

</td>
</tr>
</table>

This will pick up values serialized in `window` during SSR (like `window.__NUXT__`) and make sure they're available through `useHydration()`, <b>fastify-vite</b>'s unified helper for dealing with isomorphic data. See more in <b>[Client Hydration]()</b>, <b>[Route Payloads]()</b> and <b>[Isomorphic Data]()</b>. 

## Routing Setup

Similarly to the way `createRenderFunction()` works, providing a `routes` array in your server entry export is what ensures you can have individual Fastify [route hooks](), [payloads]() and [isomorphic data fetching]() for each of your [Vue Router][vue-router] routes. That is, <b>fastify-vite</b> [will use]() this array to automatically <b>register one individual route</b> for them while applying any hooks and data functions provided.

[vue-router]: https://router.vuejs.org/

::: tip
<b>If you don't export</b> `routes`, you have to tell Fastify what routes you want rendering your SSR application:

```js
fastify.vite.get('/*')
```

And in this case, any <b>_hooks_</b> or <b>_data functions_</b> exported directly from your Vue files <b>would be ignored</b>.
:::

Fastify uses an [extremely fast router based on a radix tree][find-my-way], making the overhead of this layering of routers minimal. Ideally, [Vue Router][vue-router] would provide a way to preset a route during SSR, like React's [StaticRouter][static-router] (a router that never changes location) but this is not supported yet.

[find-my-way]: https://github.com/delvedor/find-my-way
[static-router]: https://reactrouter.com/web/api/StaticRouter
[vue-router]: https://next.router.vuejs.org/


<table class="infotable">
<tr>
<td style="width: 20%">
<div class="language-"><pre><code>
├─ entry/
│  ├─ client.jsx
│  └─ server.jsx
├─ views/
│  ├─ index.jsx
│  └─ about.jsx
├─ index.html
├─ base.vue
├─ <b style="color: #ec6f2d">routes.js</b>
├─ main.js
└─ server.js
</code></pre></div>
</td>
<td>

```js
export default [
  {
    path: '/',
    component: () => import('./views/index.jsx'),
  },
  {
    path: '/about',
    component: () => import('./views/about.jsx'),
  },
]
```

</td>
</tr>
</table>

You can set view route paths directly from Vue files by using the `loadRoutes()` helper provided by <b>fastify-vite-react</b>. It will collect route data functions that you may have exported directly from your Vue files. See more in <b>[Route Payloads]()</b> and <b>[Isomorphic Data]()</b>. 

<table class="infotable">
<tr>
<td style="width: 20%">
<div class="language-"><pre><code>
├─ entry/
│  ├─ client.jsx
│  └─ server.jsx
├─ views/
│  ├─ index.jsx
│  └─ about.jsx
├─ index.html
├─ base.vue
├─ <b style="color: #ec6f2d">routes.js</b>
├─ main.js
└─ server.js
</code></pre></div>
</td>
<td>

```js

import { loadRoutes } from 'fastify-vite-react/app'

export default loadRoutes(import.meta.globEager('./views/*.vue'))
```

</td>
</tr>
</table>



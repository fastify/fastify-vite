
# Using Vue

<b>fastify-vite</b>'s 
[base Vue 3 starter boilerplate](...) is based on the [official Vue 3 SSR example][ssr-vue] from Vite's [playground][playground]. The differences start with `server.js`, where the [raw original _Express_-based example][vue-server.js] can be replaced with the following Fastify server initialization boilerplate:

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

const fastify = require('fastify')()
const fastifyVite = require('fastify-vite')
const fastifyViteVue = require('fastify-vite-vue')

async function main () {
  await fastify.register(fastifyVite, {
    api: true,
    root: __dirname,
    renderer: fastifyViteVue,
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

For the <b>server</b> entry point, instead of providing only a `render` function, with <b>fastify-vite</b> you can also provide a `routes` array. The `render` function itself should be created with the factory function provided by <b>fastify-vite-vue</b>, `createRenderFunction()`, which will automate things like [client hydration]() and add support for [route hooks](), [payloads]() and [isomorphic data fetching]().

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

## Routing Setup

Likewise, providing a `routes` array is what ensures you can have individual Fastify [route hooks](), [payloads]() and [isomorphic data fetching]() for each of your VueRouter routes.

Fastify uses an [extremely fast router based on a radix tree][find-my-way], making the overhead of this layering of routers minimal. Ideally, [VueRouter][vue-router] would provide a way to preset a route during SSR, like React's [StaticRouter][static-router] (a router that never changes location) but this is not supported yet.

[find-my-way]: https://github.com/delvedor/find-my-way
[static-router]: https://reactrouter.com/web/api/StaticRouter
[vue-router]: https://next.router.vuejs.org/


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
export default [
  {
    path: '/',
    component: () => import('./views/index.vue'),
  },
  {
    path: '/about',
    component: () => import('./views/about.vue'),
  },
]
```

</td>
</tr>
</table>

You can set view route paths directly from Vue files by using the `loadRoutes()` helper provided by <b>fastify-vite-vue</b>. It will collect hooks (functions named after any of [Fastify's route hooks](), [payload]() and [isomorphic data]() functions that you have exported directly from your Vue files.

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


::: tip
In Nuxt.js and Next.js, you can get started with a single component file. These frameworks allow this by doing a lot of heavy lifting <b>hidden from your eyes</b>, relying on a runtime that will pick up the files you provide and stitch together a full blown app, kept in a `.nuxt` or `.next` folder, that you're not supposed to mess around with.
:::

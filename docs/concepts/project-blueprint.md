
# Project Blueprint

Some conventions are used in the official boilerplates, but they are easy to override and defined mostly by renderer adapters. For instance, <b>fastify-vite-vue</b> expects the client entry point to be located at `entry/client.js` while <b>fastify-vite-react</b> expects it at `entry/client.jsx`.

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
  await app.vite.ready()
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

const fastify = require('fastify')
const fastifyVite = require('fastify-vite')
const fastifyViteReact = require('fastify-vite-react')

async function main () {
  const app = fastify()
  await app.register(fastifyVite, {
    root: __dirname,
    renderer: fastifyViteReact,
    build: process.argv.includes('build'),
  })
  await app.vite.ready()
  return fastify
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

The `build` option is already set to `process.argv.includes('build')` by default, but it was made explicit above as to show how <b>fastify-vite</b> makes your app recognize the `build` command.


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

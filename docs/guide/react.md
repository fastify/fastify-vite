getHydrationScript
renderPreloadLinks
getPreloadLink

# Using React

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
This is the equivalent of [nuxt build]() and [next build]().
:::

The second difference from Vite's official Vue 3 SSR example is the [server entry point][server-entry-point]. Instead of providing only a `render` function, with <b>fastify-vite</b> you can also provide a `routes` array.

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


The reason this routes array is optional is that you can still manually register Fastify

::: tip
In Nuxt.js and Next.js, you can get started with a single component file. These frameworks allow this by doing a lot of heavy lifting <b>hidden from your eyes</b>, relying on a runtime that will pick up the files you provide and stitch together a full blown app, kept in a `.nuxt` or `.next` folder, that you're not supposed to mess around with.
:::

## Configuration

**fastify-vite** tries to intefere as little as possible in configuring your
Vite apps. 

So if you want to just have `vite.config.js` for all Vite settings,
that will just work as expected. However, you can also use the `vite` key
when passing options to the `fastify.register()` call.

[Here](...) you can see the internal `options.js`, which lists all defaults too.

<table class="infotable">
<tr style="width: 100%">
<td style="width: 20%">
<strong>Required</strong>
<br><br>
</td>
<td class="code-h" style="width: 80%">
<code class="h inline-block">root</code>
—— The Vite client app's source root
<br><br>
<code class="h inline-block">renderer</code>
—— <b>fastify-vite</b>'s <a href="./renderers">renderer adapter</a>
<br><br>
</td>
</tr>
</table>

<table class="infotable">
<tr style="width: 100%">
<td style="width: 20%">
<strong>Optional</strong>
<br><br>
</td>
<td>
<code class="h inline-block">entry.client</code>
—— The Vite client app's client entry point
<br><br>
<code class="h inline-block">entry.server</code>
—— The Vite client app's client entry point
</td>
</tr>
</table>

## Vite defaults

```js
  hydration: {
    global: '$global',
    data: '$data',
  },
  // Vite root app directory, whatever you set here
  // is also set under `vite.root` so Vite picks it up
  root: process.cwd(),
  // App's entry points for generating client and server builds
  entry: {
    // This differs from Vite's choice for its playground examples,
    // which is having entry-client.js and entry-server.js files on
    // the same top-level folder. For better organization fastify-vite
    // expects them to be grouped under /entry
    client: '/entry/client.js',
    server: '/entry/server.js'
  },
  // Any Vite configuration option set here
  // takes precedence over <root>/vite.config.js
  vite: {
    // Vite's logging level
    logLevel: dev ? 'error' : 'info',
    // Vite plugins needed for Vue 3 SSR to fully work
    plugins: [
      vuePlugin(),
      vueJsx()
    ],
    // Base build settings, default values
    // for assetsDir and outDir match Vite's defaults
    build: {
      assetsDir: 'assets',
      outDir: 'dist',
      minify: !dev,
    },
  }
}
```

<b>[See all available configuration options for Vite](https://vitejs.dev/config/)</b>.


## Vue 3+

```js
const Fastify = require('fastify')
const fastifyVite = require('fastify-vite')
const fastifyViteVue = require('fastify-vite-vue')

async function getServer () {
  const fastify = Fastify()
  await fastify.register(fastifyVite, {
    renderer: fastifyViteVue,
  })
  return fastify
}

getServer().then(fastify => fastify.listen(3000))
```

```
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
└─ server.js
```

## React 17+

```js
const fastifyViteReact = require('fastify-vite-react')

async function getServer () {
  const fastify = Fastify()
  await fastify.register(fastifyVite, {
    renderer: fastifyViteReact,
  })
  return fastify
}
```

```
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
└─ server.js
```

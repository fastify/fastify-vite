# Vue 3+

<div class="inline-code"><code>
npm i <b>fastify</b> <b>fastify-vite</b> <b>fastify-vite-vue</b> --save
</code></div>

## Minimal Boilerplate

Below is a minimal script to boot a Fastify server with an integrated Vite app:

```js
import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import FastifyViteVue from 'fastify-vite-vue'

const app = Fastify({
  logger: true,
})

await app.register(FastifyVite, {
  root: import.meta.url,
  renderer: FastifyVite,
})

await app.vite.ready()
await app.listen(3000)
```

Assuming you have saved the snippet above as `app.mjs`:

<div class="inline-code"><code>
node app.mjs
</code></div>

Take note that `root` and `renderer` are <b>fastify-vite</b>'s only required plugin options. The first is the [Vite application root](https://vitejs.dev/config/#root) and the second determines what [renderer adapter](/concepts/renderer-adapters) to use.

::: tip
All examples in the documentation use [ESM][esm], but it's not required. If you use CJS, use `__dirname` instead of `import.meta.url` when setting the `root` option. It will know the difference.

[esm]: https://nodejs.org/api/esm.html

:::

## Index HTML template

```html
<!DOCTYPE html>
<html>
<head>
${head.preload}
${head.tags}
</head>
<body>
${hydration}
<div id="app">${element}</div>
<script type="module" src="@app/entry/client.js"></script>
</body>
</html>
```

As you can probably imagine, these variable names cannot be changed because they are used by <b>fastify-vite-vue</b>'s internal rendering functions. The contents of <b>index.html</b> itself are compiled into a function loaded into memory for maximum performance.

## Blueprint Files

The fastify-vite-vue package [will provide](/concepts/project-blueprint) nearly all your starting boilerplate, the snippet , where you actually register fastify-vite in your Fastify application, being the only exception you're expected to provide yourself. The files provided by fastify-vite-vue are listed below.

<table class="infotable"><tr><td>
<code class="h inline-block">client.js</code></td>
<td>Must export a <code>createApp</code> function <b>returning a Vue application instance</b>.
</td></tr><tr><td>
<code class="h inline-block">client.vue</code></td>
<td>Must export the <b>main Vue component for your app</b>.
<br><br>That would be the one where you set a layout, a router view etc.
</td></tr><tr><td>
<code class="h inline-block">routes.js</code></td>
<td>Must have a default export with the Vite application's routes array.
</td></tr><tr><td>
<code class="h inline-block">head.js</code></td>
<td>Array of &lt;head&gt; elements, following <a href="https://github.com/vueuse/head">@vueuse/head</a>'s format.
</td></tr><tr><td>
<code class="h inline-block">entry/client.js</code></td>
<td>Vite application client entry point (DOM element mount).
</td></tr><tr><td>
<code class="h inline-block">entry/server.js</code></td>
<td>Vite application server entry point (render function and routes).
</td></tr><tr><td>
<code class="h inline-block">index.html</code></td>
<td>Vite application <b>main</b> entry point (loads client entry point).
</td></tr></table>


[vue-server.js]: https://github.com/vitejs/vite/blob/main/packages/playground/ssr-vue/server.js
[ssr-vue]: https://github.com/vitejs/vite/tree/main/packages/playground/ssr-vue
[playground]: https://github.com/vitejs/vite/tree/main/packages/playground

## Global Data

Global Data is automaticallyed added to [`globalProperties`][global-properties] as `$global`.

[global-properties]: https://v3.vuejs.org/api/application-config.html#globalproperties

```vue
<template>
  <h2>Accessing global data from the server</h2>
  <p>{{ $global }}</p>
</template>
```

You can also access it via the context object returned by the [`useHydration`](/reference/functions) hook.

```vue
<template>
  <h2>Accessing global data from the server</h2>
  <p>{{ foobar }}</p>
</template>

<script>
import { useHydration } from 'fastify-vite-vue/client'

export const path = '/global-data'

export default {
  async setup () {
    const ctx = await useHydration()
    return { foobar: ctx.$global }
  }
}
</script>
```
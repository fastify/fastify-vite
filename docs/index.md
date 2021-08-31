
<style>
.headline {
  font-size: 2em;
}
</style>

<p class="headline">
<a href=""><b>Fastify</b></a> plugin for <b>Vite</b> integration<br>
<b>Build</b> and <b>run</b> SSR client applications</p>

A minimal and fast alternative to full blown mega SSR frameworks like Nuxt.js and Next.js.

- Currently supports Vue 3+ and React 17+ — using the same [modular renderer API](/guide/renderers.html).
- Automatically registers <b>individual Fastify routes</b> for your client application routes
- Provides generic utilities for [client hydration](/guide/route-payload) and [isomorphic data fetching](/guide/isomorphic-api).
- No magic application folder (<b>.nuxt</b>, <b>.next</b>), just start with the right [boilerplate flavor](...).

Assuming you have a folder setup [like this one](...), below is all that's needed to get started:

```js
const fastify = require('fastify')()
const fastifyVite = require('fastify-vite')
const renderer = require('fastify-vite-vue')

fastify.register(fastifyVite, { renderer })
fastify.listen(3000, (_, address) => console.log(`Listening at ${address}`))
```

See [Motivation](...), [Philosophy](...) and [Roadmap](...). <b>MIT</b> licensed.

# fastify-vite

[**Fastify**][fastify] plugin to serve [**Vite**][vite] applications. **Currently only supports Vue 3**.

[fastify]: http://fastify.io/
[vite]: http://vitejs.dev/

**Latest release**: **`0.0.2`**. **Still experimental, lacking a test suite**.

## Install

```
npm install fastify-vite --save-dev
```

## Basic usage

```js
const fastify = require('fastify')()
const fastifyVite = require('fastify-vite')

fastify.register(fastifyVite, {
  // Where your vite.config.js is located
  // Defaults to process.cwd() if unset
  rootDir: __dirname, 
})

fastify.get('/*', fastify.vite.handler)
```

You can mount multiple routes on the same `fastify.vite.handler`. The motivation
for this is that **you may want to specify parameters and run hooks at the Fastify
level** for different routes of your Vue 3 app, for instance:

```js
fastify.route({
  url: '/user/:user',
  // Run this preHandler only for /user/:user routes
  async preHandler (req) {
    fastify.metrics.userAccess(req.params.user)
  }
  handler: fastify.vite.handler
})
// For everything else, get to the Vite handler straight away
fastify.get('/*', fastify.vite.handler)
```

## Data fetching

To fetch data on the server, use it for server rendering, and rehydrate later 
for client rendering, similar to what Nuxt and Next.js do, this plugin provides 
the `fastify.vite.get` helper. 

It will register a route automatically setting
`fastify.vite.handler` as the **handler**, and the return value of the provided 
`ssrData()` function is injected into `req.$ssrData` via an automatically set 
`preHandler` hook.

```js
fastify.vite.get('/hello', {
  ssrData (req) {
    return { message: `Hello from ${req.raw.url}` }
  },
})
```

This will cause `window.$ssrData` to be written to the client using 
[`@nuxt/devalue`][0]. 

[0]: https://github.com/nuxt-contrib/devalue

It will also automatically register an extra endpoint based on the original `routePath` for retrieving the data returned by `ssrData` on-demand from the client. **For example, for the `/hello` route registered above via `fastify.vite`, a `/-/data/hello` route is also registered and made available for GET requests.**

Both the final `$ssrData` data object and `$ssrDataPath`, a string with the endpoint you can use to construct client-side requests, can be easily injected into `globalProperties`. If you use this pattern, as shown in the [client]() and [server]() entry points of the [example app](), you can use the useSSRData hook provided by this plugin:

```vue
<template>
  <h1 @click="refreshData">{{ data.message }}</h1>
</template>

<script>
import { ref } from 'vue'
import { useSSRData } from 'fastify-vite/hooks'

export default {
  setup () {
    const [ data, dataPath ] = useSSRData()
    const refreshData = async () => {
      const response = await fetch(dataPath)
      data.value = await response.json()
    }
    return { data, refreshData }
  }
}
</script>
```


You can also just use [`serverPrefetch`][1], but with the approach described 
above you're able to skip the Vite rendering phase altogether if something goes 
wrong with the data fetching.

[1]: https://github.com/vuejs/vue-next/commit/c73b4a0e10b7627d2d0d851e9abfeac9b6317e45

## Multiple apps

Multiple Vite apps are supported via Fastify's own [encapsulation][2].

[2]: https://github.com/fastify/fastify/blob/master/docs/Encapsulation.md

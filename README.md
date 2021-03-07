# fastify-vite

[**Fastify**][fastify] plugin to serve [**Vite**][vite] applications. **Currently only supports Vue 3**.

[fastify]: http://fastify.io/
[vite]: http://vitejs.dev/

**Latest release**: **`1.0.5`**. **Still experimental, lacking a test suite**.

## Install

```
npm install fastify-vite --save-dev
```

## Example app

To play with the [example app][example-app]:

[example-app]: https://github.com/galvez/fastify-vite/tree/main/example

```sh
cd example
npm install
npm run dev
```

See all script options in [its package.json][example-package-json] for more.

[example-package-json]: https://github.com/galvez/fastify-vite/blob/main/example/package.json

## Basic usage

```js
async function main () {
  const fastify = require('fastify')()
  await fastify.register(require('fastify-vite'), {
    // Where your vite.config.js is located
    // Defaults to process.cwd() if unset
    rootDir: __dirname, 
  })

  fastify.get('/*', fastify.vite.handler)
}

main()
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
  },
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

It will also automatically register an extra endpoint based on the original 
`routePath` for retrieving the data returned by `ssrData` on-demand from the 
client. **For example, for the `/hello` route registered above via 
`fastify.vite`, a `/-/data/hello` route is also registered and made available 
for GET requests.**

Both the final `$ssrData` data object and `$ssrDataPath`, a string with the 
endpoint you can use to construct client-side requests, can be easily 
injected into [`globalProperties`][gp]. If you use this pattern, as shown in 
the [client][client-src] and [server][server-src] entry points of the 
[example app][example-app], you can use the `useSSRData` hook provided by 
the plugin:

[gp]: https://v3.vuejs.org/api/application-config.html#globalproperties
[client-src]: https://github.com/galvez/fastify-vite/blob/main/example/entry/client.js
[server-src]: https://github.com/galvez/fastify-vite/blob/main/example/entry/client.js

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

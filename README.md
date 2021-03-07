# fastify-vite

Fastify plugin to serve Vite applications.

Currently written with a focus on Vue 3, but other frameworks can be worked in.

_This would mean turning [`handler.js`][handler] into `handlers/vue.js` and adding a 
different handler for each if needed. Contributions welcome._

[handler]: https://github.com/galvez/fastify-vite/blob/main/handler.js

## Install

```
npm install --save fastify-vite
```

## Usage

```js
const fastify = require('fastify')()
const fastifyVite = require('fastify-vite')

fastify.register(fastifyVite, {
  // If you don't set rootDir, process.cwd() is used by default
  rootDir: __dirname,
  // If you don't set srcDir, process.cwd()/src is used by default
  srcDir: resolve => resolve(__dirname, 'src'),
})

fastify.get('/*', fastify.vite.handler)
```

## Data fetching

To fetch data on the server, use it for server rendering, and rehydrate later 
for client rendering, similar to what Nuxt and Next.js do, this plugin provides 
the following idiom:

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

It will also automatically register an extra endpoint based on the original `routePath` for retrieving the data returned by `ssrData` on-demand from the client. For example, for the `/hello` route registered above via `fastify.vite`, a `/-/data/hello` route is also registered and made available for GET requests.

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

To run multiple Vite apps in the same Fastify server, just [encapsulate][2] your 
`fastify-vite` instances in different application level plugins.

[2]: https://github.com/fastify/fastify/blob/master/docs/Encapsulation.md

# fastify-vite

Fastify plugin to serve Vite applications.

## Install

```
npm install --save fastify-vite
```

## Usage

```js
const fastify = require('fastify')()
const fastifyVite = require('fastify-vite')

fastify.register(fastifyVite, {
  // If you don't set rootDir, __dirname is used by default
  rootDir: __dirname,
  // If you don't set srcDir, __dirname/src is used by default
  srcDir: resolve(__dirname, 'src'),
})

fastify.get('/*', fastify.vite.handler)
```

## Data fetching

To fetch data on the server, use it for server rendering, and rehydrate later 
for client rendering, similar to what Nuxt and Next.js do, this plugin provides 
the following idiom:

```js
fastify.vite.get('/with-data', {
  ssrData (req) {
    return { message: `Hello from ${req.raw.url}` }
  },
})
```

This will cause `window.$ssrData` to be written to the client using 
[`@nuxt/devalue`][0]. That key can be customized via `options.ssrDataKey`.

[0]: https://github.com/nuxt-contrib/devalue

In your Vue component, you can access `ssrData` with:

```vue
<script setup>
import { getSSRData } from 'fastify-vite'

const data = getSSRData('<ssrDataKey>')
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

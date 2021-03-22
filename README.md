# fastify-vite

[**Fastify**][fastify] plugin to serve [**Vite**][vite] applications. **Currently only supports Vue 3**.

[fastify]: http://fastify.io/
[vite]: http://vitejs.dev/

**Latest release**: **`2.0.0-beta.10`**.
Check out the **[release notes](https://github.com/galvez/fastify-vite/releases/tag/v2.0.0-beta)**.

This plugin is for minimalists who want a **lean, fast** stack where they have 
as much control as possible. You can build any app with it that you would with 
Nuxt.js or Next.js, for sure, but it's targeted at a more low-level approach 
to development, instead of trying to do everything for you.

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
for client rendering, similar to what Nuxt.js and Next.js do, there are **two
approaches** made possible with this plugin.

### 1. Prepass: fetch data before any Vue code runs

Use `fastify.vite.get` or `fastify.vite.post` to register your Vite routes that
need data. It will register routes automatically setting `fastify.vite.handler`
as their **handler**, and the return value of the provided `data()` function is 
injected into `req.$data` via an automatically set `preHandler` hook. 

So if you write:

```js
fastify.vite.get('/hello', {
  data (req) {
    return { message: `Hello from ${req.raw.url}` }
  },
})
```

This will cause `window.$data` to be written to the client using 
[`@nuxt/devalue`][0]. 

[0]: https://github.com/nuxt-contrib/devalue

It will also automatically register an extra endpoint based on the original 
`routePath` for retrieving the data returned by `data` on-demand from the 
client. **For example, for the `/hello` route registered above via 
`fastify.vite`, a `/-/data/hello` route is also registered and made available 
for GET requests.**

Both the final `$data` data object and `$dataPath`, a string with the 
endpoint you can use to construct client-side requests, can be easily 
injected into [`globalProperties`][gp]. If you use this pattern, as shown in 
the [client][client-src] and [server][server-src] entry points of the 
[example app][example-app], you can use the `useServerData` hook provided 
by the plugin:

[gp]: https://v3.vuejs.org/api/application-config.html#globalproperties
[client-src]: https://github.com/galvez/fastify-vite/blob/main/example/entry/client.js
[server-src]: https://github.com/galvez/fastify-vite/blob/main/example/entry/client.js

```html
<template>
  <h1 @click="refreshData">{{ data.message }}</h1>
</template>

<script>
import { ref } from 'vue'
import { useServerData } from 'fastify-vite/hooks'

export default {
  setup () {
    const [ data, dataPath ] = useServerData()
    const refreshData = async () => {
      const response = await fetch(dataPath)
      data.value = await response.json()
    }
    // If navigation happened client-side
    if (!data.value && !import.meta.env.SSR) {
      await refreshData()
    }
    return { data, refreshData }
  }
}
</script>
```

### 2. Combining useServerAPI() and useServerData()

You can also use `useServerAPI()` if you set `options.api` to `true` and have
the [`fastify-api`](https://github.com/galvez/fastify-api) plugin registered. 
This will literally send a minimal API manifesto to the client that it uses to 
build an actual set of callable methods interfacing to 
[`native fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

On the server, API routes defined with `fastify-api` are automatically made 
available via `fastify.api.client`, i.e., instead of having to execute HTTP
requests on the server to reuse API routes, you can just call the functions 
instead. The `useServerAPI()` hook ensures your API route methods are available
and work the same way both on the server and on the client.

The problem is, just ensuring you can call an API method seamlessly on the server
and client isn't enough, because for first render, you'd be repeating the same
call on the server and client. This is what Nuxt's `asyncData()` prevents, it 
runs code on the server, serializes the data on the client, and the next time
it runs, already on the client, it'll use the serialized data instead of making
a fresh request to the API it consumes.

To solve this in **fastify-vite**, pass a function to `useServerData()`:

```js
import { reactive, getCurrentInstance, ref } from 'vue'
import { useServerAPI, useServerData } from 'fastify-vite/hooks'

const api = useServerAPI()
const data = await useServerData(async () => {
  const { json } = await api.echo({ msg: 'hello from server '})
  return json
})
const state = reactive({ count: 0, msg: data.msg })
const fetchFromEcho = async () => {
  const { json } = await api.echo({ msg: 'hello from client '})
  state.msg = json.msg
}
```

This ensures the value of `data` is obtained once on the server during first 
render, and rehydrated from serialized data the first time it runs on the client.

**The really convenient thing is**: it stays working for subsequent, fresh requests
on the client, so you can place a call to a function that uses `useServerData()`
in Vue 3's `watchEffect()`, for instance, and it'll keep working for fetching
fresh data, with the exact same signature of the code that ran on the server.

See the `example/` folder for a functioning example of it.

## Server global data

If you have static data on the server that you want to send to the client, you
can use the `fastify.vite.global` option. Just set an object to it and on the
client, you have access to `$global` in templates. 

```js
fastify.vite.global = { prop: 'static data' }
```

You can also access it in `setup()` via `getCurrentInstance()`:

```js
import { getCurrentInstance } from 'vue'

export default {
  setup() {
    const globalData = getCurrentInstance().appContext.app.config.$global
    // ...
  }
}
```

## Multiple apps

Multiple Vite apps are supported via Fastify's own [encapsulation][2].

[2]: https://github.com/fastify/fastify/blob/master/docs/Encapsulation.md

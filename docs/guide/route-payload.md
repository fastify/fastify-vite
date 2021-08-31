# Route Payload

# Data fetching

To fetch data on the server, use it for server rendering, and rehydrate later 
for client rendering, similar to what Nuxt.js and Next.js do, there are **two
approaches** made possible with this plugin.

## 1. Prepass: fetch data before any Vue code runs

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

## 2. Combining useServerAPI() and useServerData()

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

The most common use for this is to dynamically pass environment variables
from the server, for when you can't rely on having the statically built 
values for them in SSR.

# Hydration

**fastify-vite** is inspired by Next's and Nuxt's approach to hardcode 
serialized objects into the HTML as additions to `window`. You can see it
happening for Next in [next/client/index.tsx][next-take] and in 
[vue-app/template/utils.js][nuxt-take] for Nuxt.

[next-take]: https://github.com/vercel/next.js/blob/85499b5375dace853e236877510ea6a306014a90/packages/next/client/index.tsx
[nuxt-take]: https://github.com/nuxt/nuxt.js/blob/346a57eb3486035495f9047324847e8b13d6e3c0/packages/vue-app/template/utils.js

**fastify-vite**'s implementation will appear simpler, but that's mainly because 
Vite takes care of a lot of what Next and Nuxt are doing. So the code for it can 
be more focused on the hydration process itself, rather than all the things 
Next and Nuxt are doing for you that Fastify and Vite already do on their own.

The whole topic of server and client hydration is very nicely covered in [this
Google Developers article][gd-article] by [Jason Miller][jason-miller] and 
[Addy Osmani][addy-osmani].

[gd-article]: https://developers.google.com/web/updates/2019/02/rendering-on-the-web#rehydration
[jason-miller]: https://twitter.com/_developit
[addy-osmani]: https://twitter.com/addyosmani

## Step 1: render function returned by getRender()

Scanning the code for fastify-vite's [render.js module][fastify-vite-render], 
which provides the `render` function used by Vite as the **server entry point**,
you'll first find this snippet relating to hydration:

```js
app.config.globalProperties[hydration.global] = req[hydration.global]
app.config.globalProperties.$dataPath = () => `/-/data${req.routerPath}`
app.config.globalProperties[hydration.data] = req[hydration.data]
app.config.globalProperties.$api = req.api && req.api.client
```

We use Vue 3's [globalProperties object][global-properties] to make it easy to 
inject all these objects into Vue's application context. The default values
for hydration.global, hydration.data and hydration.api are `$global`, `$data` 
and `$api`. See the [Fetching guide][fetching-guide] to learn how to use them.

[fastify-vite-render]: https://github.com/galvez/fastify-vite/blob/main/render.js 
[global-properties]: https://v3.vuejs.org/api/application-config.html#globalproperties
[fetching-guide]: https://github.com/galvez/fastify-vite/blob/main/docs/fetching.md

Still in `render.js`, further below, you'll find:

```js
const globalData = req[options.hydration.global]
const data = req[hydration.data] || app.config.globalProperties[hydration.data]
const api = req.api ? req.api.meta : null
```

Using the default hydration keys, it'll try and pick up `$global` from 
`req.$global`, `$data` from either `req.$data` or `globalProperties.$data` (in
the case data was requested from inside Vue routes by passing a function to
`useServerData()`). For hydrating the API client, if you're using 
[**fastify-api**][fastify-api] and enabled integration with **fastify-vite**, 
it'll pick it up from `req.api`.

[fastify-api]: https://github.com/galvez/fastify-api

## Step 2: passing hydrations to the HTML template

Next, still in `render.js`, we have the bit that generates the `<script>` tag
where all serialized data from the server goes into `window`.

```js
let hydrationScript = ''

if (globalData || data || api) {
  hydrationScript += '<script>\nlet key\n'
  if (globalData) {
    hydrationScript += `key = Symbol.for('${hydration.global}')\n`
    hydrationScript += `window[key] = ${devalue(globalData)}\n`
  }
  if (data) {
    hydrationScript += `key = Symbol.for('${hydration.data}')\n`
    hydrationScript += `window[key] = ${devalue(data)}\n`
  }
  if (api) {
    hydrationScript += 'key = Symbol.for(\'fastify-vite-api\')\n'
    hydrationScript += `window[key] = ${devalue(api)}\n`
  }
  hydrationScript += '</script>'
}
```

Finally, in **fastify-vite**'s internal [html.js module][html-module], you'll
see where `hydrationScript` ends up inserted in the final document.
**In a future version, html.js will be auto generated with pre-compiled string 
interpolation** so there's no need to call `replace()` multiple times.

[html-module]: https://github.com/galvez/fastify-vite/blob/main/html.js


## Step 3: hydrate() provided by fastify-vite/hydrate

In your app's **client entry point**, you can use the `hydrate()` helper. It 
takes two parameters letting you specify custom keys for `$data` and `$global`
in case you have different values in your [configuration][config-docs].

[config-docs]: https://github.com/galvez/fastify-vite/blob/docs/config.md

```js
import { createApp } from '../main'
import { hydrate } from 'fastify-vite/hydrate'
const { app, router } = createApp()

hydrate(app)

// Wait until router is ready before mounting to ensure hydration match
router.isReady().then(() => app.mount('#app'))
````

[See the definition for hydrate() here][hydrate-helper]. 

[hydrate-helper]: https://github.com/galvez/fastify-vite/blob/main/hydrate.js

## How is an API client made automatically available?

You'll notice `hydrate()` calls an internal helper called `setupServerAPI()`.

Let's take a step back and figure out what's happening here together.

In the [example app][example-app], you'll see the following route definitions:

[example-app]: https://github.com/galvez/fastify-vite/tree/main/example
```js
fastify.api(({ get }) => ({
  echo: get('/echo/:msg', ({ msg }, req, reply) => {
    reply.send({ msg })
  }),
  other: get('/other', (req, reply) => {
    reply.send('string response')
  }),
}))
````

These are **reusable API methods** made possible via [**fastify-api**][fastify-api],
which uses `fastify.inject()` under the hood to make fake HTTP requests to the
live server, as if they were actually functions to call. The way these fake HTTP
request run through Fastify is actually very fast, making 
[fastify-lambda-aws][fastify-lambda-aws] possible, for example. I figured
it would be reliable and fast enough to back functions to call API routes.

[fastify-lambda-aws]: https://github.com/fastify/aws-lambda-fastify

The trick of **fastify-api** is to collect metadata on the routes being defined,
mainly their associated **HTTP method**, **route pattern** and **method name**, 
either specified directly in an object like in the example above, or inferred 
from a regular function's name.

```js
{
  echo: ['GET', '/echo/:msg'],
  other: ['GET', '/other'],
}
```

[See the docs for fastify-api for more details.][fastify-api]

**fastify-api** uses this metadata to dynamically construct an API client on 
the server automatically creating **wrapper functions** that will call 
`fastify.inject()` with the appropriate parameters and return a response.

So for `/echo/:msg` above, `fastify.api.client.echo({ msg })` is automatically
made available. It uses a [Proxy][proxy-js] instance that will look for matching
methods name in the API metadata and use it to return a wrapper function.

[proxy-js]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy

Back to `setupServerAPI()` used by `hydrate()` on the client, since it has 
access to the API methods metadata from the server in `globalProperties.$api`,
it can use the exact same `Proxy`-based pattern to build wrapper functions to
the natively available `fetch()`, with has also the exact same signature when 
calling from the server via `fastify.api.client`.

That's what the internal `getFetchWrapper()` helper from `hydrate.js` is for.

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

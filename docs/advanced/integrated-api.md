
# Integrated API

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

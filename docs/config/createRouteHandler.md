# `createRouteHandler(client, scope, options)`

This configuration function creates the default **route handler** for registering Fastify routes based on the client module `routes` exported array (if available). See its [default definition](https://github.com/fastify/fastify-vite/blob/dev/packages/fastify-vite/config.js#L71) below:

```js
function createRouteHandler (client, scope, options) {
  return async function (req, reply) {
    const page = await reply.render(scope, req, reply)
    reply.html(page)
  }
}
```

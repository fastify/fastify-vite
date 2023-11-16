# `createRoute({ handler, errorHandler, route }, scope, config)`

Finally, this configuration function is responsible for actually registering an individual Fastify route for each of your client-level routes. See its [default definition](https://github.com/fastify/fastify-vite/blob/dev/packages/fastify-vite/config.js#L60) below:

```js
function createRoute ({ handler, errorHandler, route }, scope, config) {
  scope.route({
    url: route.path,
    method: 'GET',
    handler,
    errorHandler,
    ...route,
  })
}
```
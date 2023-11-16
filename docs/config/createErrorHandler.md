# `createErrorHandler(client, scope, config)`

This configuration function creates the default **error handler** for the Fastify routes registered based on the client module `routes` exported array (if available). See its [default definition](https://github.com/fastify/fastify-vite/blob/dev/packages/fastify-vite/config.js#L79) below:

```js
function createErrorHandler (client, scope, config) {
  return (error, req, reply) => {
    if (config.dev) {
      console.error(error)
      scope.vite.devServer.ssrFixStacktrace(error)
    }
    scope.errorHandler(error, req, reply)
  }
}
```

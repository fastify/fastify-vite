
### `prepareClient({ routes, ...others }, scope, config)`

As soon as the client module is loaded, it is passed to the `prepareClient()` configuration function. 

See its default definition [here](https://github.com/fastify/fastify-vite/blob/dev/packages/fastify-vite/config.js#L39). If it finds `routes` defined, **`@fastify/vite`** will use it to register an individual Fastify (server-level) route for each of your client-level routes (`VueRouter`, `ReactRouter` etc). That's why `prepareClient()` is implemented that way by default.

See the [`react-hydration`](https://github.com/fastify/fastify-vite/tree/dev/examples/react-hydration) and [`vue-hydration`](https://github.com/fastify/fastify-vite/tree/dev/examples/vue-hydration) examples to see how the same `routes.js` file is used to set up ReactRouter and VueRouter, and the associated Fastify routes.
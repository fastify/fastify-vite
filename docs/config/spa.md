
### `spa`

**Disables SSR** and just sets up integration for delivering a static SPA application. When set to `true`, `clientModule` resolution is disabled and the `Reply.html()` method doesn't require a context object with variables for the `index.html` template.

You can see it in the streaming [examples/](https://github.com/fastify/fastify-vite/tree/dev/examples).
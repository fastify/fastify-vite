# Global Data

You can easily make data from the server <b>globally available</b> (and properly [client hydrated](/internals/client-hydration)) by simply assigning to `fastify.vite.global`:

```js
fastify.vite.global = { foobar: 123 }
```

This object is made available to requests as `req.$global`.

And **serialized** to the HTML document as `window[Symbol.for('kGlobal')]` for hydration.

This can be used, for instance, to serialize public `process.env` variables to the client.

# static-options

This example demonstrates the `fastifyStaticOptions` configuration option, which forwards options to the underlying `@fastify/static` registrations in production mode.

## Use Case

When using `@fastify/compress`, gzip compression strips the `Content-Length` header. This breaks nginx reverse proxies using HTTP/1.0 upstream connections. The fix is to serve pre-compressed `.gz` files directly via `@fastify/static`'s `preCompressed` option — but until `fastifyStaticOptions` was added, there was no way to pass that through.

## Example

```javascript
await server.register(FastifyVite, {
  root: import.meta.dirname,
  spa: true,
  fastifyStaticOptions: {
    preCompressed: true,
    setHeaders(res) {
      res.setHeader('X-Custom-Header', 'from-static-options')
    },
  },
})
```

## Running the Example

1. Build: `pnpm build`
2. Start: `pnpm start`
3. Test: `pnpm test`

## What It Tests

- `setHeaders` applies custom headers to static responses in production mode
- `preCompressed` serves `.gz` files when `Accept-Encoding: gzip` is sent
- Neither option has any effect in development mode (Vite's dev server handles static files)

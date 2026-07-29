---
"@fastify/vite": major
---

Upgrade @fastify/static to v10.1.2

Includes the security fixes released in @fastify/static v10.1.1 and v10.1.2.

### Breaking Changes

- **`setHeaders` signature**: `@fastify/static` v10 passes the Fastify `Reply`
  object to the `setHeaders` callback in `fastifyStaticOptions` instead of the
  raw Node.js response.
- **Header precedence**: Headers set in `setHeaders` now take precedence over the headers
  `@fastify/static` sets itself (e.g. `Cache-Control` from `maxAge`).

### Migration

If you pass a `setHeaders` callback via `fastifyStaticOptions`:

```js
// Before
setHeaders(res) {
  res.setHeader('X-Custom-Header', 'value')
}

// After
setHeaders(reply) {
  reply.header('X-Custom-Header', 'value')
}
```

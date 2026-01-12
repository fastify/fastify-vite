# prefix-support

This example demonstrates the fix for [issue #358](https://github.com/fastify/fastify-vite/issues/358) and serves as an integration test.

## The Bug

When registering `@fastify/vite` with Fastify's standard `prefix` option:

```javascript
await server.register(FastifyVite, {
  prefix: '/app',
  // ...
})
```

Static assets were always served at `/assets/*` instead of `/app/assets/*`. This broke reverse proxy setups where only `/app*` routes are forwarded to the application.

## The Fix

Static file registrations now respect the `prefix` option, serving assets at the correct prefixed paths.

## Running the Example

1. Build: `pnpm build`
2. Start: `pnpm start`
3. Test: `pnpm test`

Static assets are now correctly served at `/app/assets/*`.

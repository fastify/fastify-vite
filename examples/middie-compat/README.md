# middie-compat

This example reproduces [issue #259](https://github.com/fastify/fastify-vite/issues/259) and serves as an integration test to verify the fix.

## The Bug

When attempting to use both `@fastify/middie` and `@fastify/vite` plugins together, users encountered the error:

```
"The decorator 'use' has already been added!"
```

This happened because `@fastify/vite` internally registers `@fastify/middie` without checking if it's already registered.

## The Fix

`@fastify/vite` now checks if middie is already registered before registering it:

```javascript
if (!this.scope.hasDecorator('use')) {
  await this.scope.register(middie)
}
```

## Test Scenarios

This example tests two scenarios:

1. **Register middie first** - User registers `@fastify/middie` before `@fastify/vite`
2. **Use server.use() after vite.ready()** - User relies on `@fastify/vite` to register middie and uses `server.use()` afterward

## Expected Behavior

Both scenarios work in **development mode**:

- No "decorator already added" errors
- `server.use()` is available for adding Express middleware

Note: `@fastify/middie` is only registered in development mode (when `dev: true`). In production mode, middie is not needed because Vite's dev server middleware isn't used.

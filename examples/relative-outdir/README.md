# relative-outdir

This example reproduces [issue #303](https://github.com/fastify/fastify-vite/issues/303) and serves as an integration test to verify the fix.

## The Bug

When using a nested `root` directory with a relative `build.outDir`, the `vite.config.json` file is written to a location that the production runtime cannot find.

**Configuration:**

```javascript
export default {
  root: join(import.meta.dirname, 'src/client'),
  build: {
    outDir: '../../dist/build',
  },
  plugins: [viteFastify({ spa: true, useRelativePaths: true })],
}
```

**Result:**

- `vite.config.json` is written to: `dist/build/vite.config.json`
- Production runtime looks in: `dist/vite.config.json`, then `client/dist/vite.config.json`
- Neither path matches, causing startup failure

## Expected Behavior

Once issue #303 is fixed, this example should:

1. Build successfully with `pnpm build`
2. Start in production with `pnpm start`
3. Pass all integration tests

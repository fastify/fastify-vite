# relative-outdir

This example demonstrates using a custom `build.outDir` with a nested `root` directory, verifying the fix for [issue #303](https://github.com/fastify/fastify-vite/issues/303).

## Configuration

**vite.config.js:**

```javascript
export default {
  root: join(import.meta.dirname, 'src/client'),
  build: {
    outDir: '../../dist/build',
  },
  plugins: [viteFastify({ spa: true })],
}
```

The production runtime automatically searches for `vite.config.json` in the `dist/` folder and its subdirectories.

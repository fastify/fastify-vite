# Vite Build

Before you can deploy to production, you need to bundle your code through Vite.

To be more specific, you need to bundle your <b>client</b> and <b>server</b> entry points.

In a vanilla Vite app, that means having three build scripts in your `package.json`:

```json
"scripts": {
  "build": "npm run build:client && npm run build:server",
  "build:client": "vite build --ssrManifest --outDir dist/client",
  "build:server": "vite build --ssr entry/server.js --outDir dist/server",
}
```

Check out [Vite's SSR Guide][ssr-guide] for in-depth details. 

[ssr-guide]: https://vitejs.dev/guide/ssr

You can also set up `server.js` to recognize the `build` command:

```js
await app.register(fastifyVite, {
  // ...
  build: process.argv.includes('build'),
  // ...
})
```

As shown in the [Vue](/guide/vue.html) and [React](/guide/vue.html) guides. 

If `build` is true, it will force the Vite build and exit the script without starting the server.

# Deployment

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

As shown in the [Vue]() and [React]() guides. 

If `build` is true, it will force the Vite build and exit the script without starting the server.

## Live Server

Deploying a Fastify application involves generally the same steps in [deploying any Node.js application](https://www.google.com/search?q=deploying+node.js) to production — copy code to server, `npm install` dependencies and run (`node server.js`). 

Two things to keep in mind:

- Your Vite application obviously <b>must be bundled</b> (following the steps covered at the top of this page) before it can be served in production. After the build, your application bundle will be available in `./.vite/dist` (deafault), or where defined in Vite's [`build.outDir`](https://vitejs.dev/config/#build-outdir) configuration key.

- If you accidentally set `dev` to `true` in your <b>fastify-vite</b> plugin settings, you'll be using Vite's development server instead of the live rendering handler provided by your chosen framework (via the [renderer adapter](/advanced/renderer-api)). Vite's development server is <b>automatically turned off</b> in case the `NODE_ENV` environment variable is set to `production` when the application boots.

Anything beyond that is likely related to the particular server platform you're deploying to.

You'll need **Node v14+**.

## Static Build

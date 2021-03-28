# Deployment

Fastify application code doesn't have to be bundled, **but the server entry 
point for your Vite app does**. That is a module that exports the `render` 
function used for SSR. You also need to bundle your app's client code. In a 
vanilla Vite app, that means having three build scripts in your `package.json`:

```{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build --ssrManifest --outDir dist/client",
    "build:server": "vite build --ssr entry/server.js --outDir dist/server",
  }
}
```

You can understand this better by reading [Vite's SSR Guide][ssr-guide]. For the 
[example app][example-app], the server entry point is [this file][entry-server], 
which actually uses the `getRender()` helper from **fastify-vite/render**.

[ssr-guide]: https://vitejs.dev/guide/ssr
[example-app]: https://github.com/galvez/fastify-vite/tree/main/example
[entry-server]: https://github.com/galvez/fastify-vite/blob/main/example/entry/server.js
[fastify-vite-render]: https://github.com/galvez/fastify-vite/blob/main/render.js

If you ever need to deeply customize your `render` function, you can just 
replace the provided `getRender()` with your own.

## Option 1: Using vite build directly

If you decide to just use the three `vite build` calls in `package.json`, there's
nothing else involved other than tuning your [Vite `build` settings][vite-build].

[vite-build]: https://vitejs.dev/config/#build-options

## Option 2: Using the unified build command

**fastify-vite** can add a `build` command to your app.

So instead of running `next build` or `nuxt build`, for instance, can you run:

```bash
node <your-app> build
```

That is to say, `build` becomes a recognizable command for the script where
you boot up your Fastify server and register **fastify-vite**. You just need to 
make one small adjustment:

```diff
const fastify = require('fastify')()
const fastifyVite = require('fastify-vite')

async function main () {
  await fastify.register(fastifyApi)
  await fastify.register(fastifyVite, { root: __dirname })
  fastify.vite.get('/*')
  return fastify
}

if (require.main === module) {
-  main.then((fastify) => {
+  fastifyVite.app(main, (fastify) => {
    fastify.listen(3000, (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Server listening on ${address}`)
    })
  })
}

module.exports = main
```

The `app()` helper from **fastify-vite** will [take care][fastify-vite-app] of 
preventing the app frgom startin if you're just running the `build` command. It 
will also automatically run all needed build commands, for `client` and `server` 
builds, using [Vite's JavaScript API][vite-js-api].

[fastify-vite-app]: https://github.com/galvez/fastify-vite/blob/main/index.js
[vite-js-api]: https://vitejs.dev/guide/api-javascript.html

## Getting code to production

Getting code ready to production has three essential steps:

- Running `npm run build` or `node <your-app> build` (read previous section)
- Coping over your app's code to your server,
  - **including the generated dist/** folder after `npm run build`
- Booting the app with `node <your-app>.js` or your favorite process manager,
  - **ensuring** the `NODE_ENV` environment variable equals `true`

You'll need **Node v14+**.

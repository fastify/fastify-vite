---
sidebarDepth: 3
---

# Deployment

Deploying a Fastify application involves generally the same steps in [deploying any Node.js application](https://www.google.com/search?q=deploying+node.js) to production — copy code to server, `npm install` dependencies and run (`node server.js`). 

A few things to keep in mind:

- Try and follow Fastify's [deployment recommendations](https://www.fastify.io/docs/latest/Recommendations/).
- Your Vite application <b>must be bundled</b> before it can be served in production. After the build, your application bundle will be available in `./dist` (default).

- Be mindful about Vite's settings, such as [build.outDir][out-dir] (`./dist`) and [build.assetsDir][assets-dir] (`assets`).

[out-dir]: https://vitejs.dev/config/#build-outdir
[assets-dir]: https://vitejs.dev/config/#build-assetsdir

- If you accidentally set `dev` to `true` in your <b>fastify-vite</b> plugin settings, you'll be using Vite's development server instead of the live rendering handler provided by your chosen framework (via the [renderer adapter](/internals/renderer-api)). Vite's development server is <b>automatically turned off</b> in case the `NODE_ENV` environment variable is set to `production` when the application boots.

Anything beyond that is likely related to the particular server platform you're deploying to.

You'll need **Node v14+**.

## Running Vite Build

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

## Static Generation

You can **prerender** a set of paths from your application into its final Vite build, so it can be served statically without live, dynamic SSR — that is — without a live Node.js server. 

::: tip
This is similar to [`nuxt generate`][nuxt-generate] and [`next export`][next-export].

[nuxt-generate]: https://nuxtjs.org/docs/2.x/concepts/static-site-generation
[next-export]: https://nextjs.org/docs/advanced-features/static-html-export
:::

### Static routes

The easiest way to do this is to set the `generate` option to `true`. As long as you provide a `routes` array as detailed in the Vue and React guides, <b>fastify-vite</b> will identify which routes  are static (don't contain any dynamic parameters) and will prerender those as part of the build.

```js
await app.register(fastifyVite, {
  generate: process.argv.includes('generate'),
})
```

With the snippet above, if you run `node server.js generate`, it would trigger the Vite build, then initialize the Fastify app so it can [process injected requests][injected-requests], prerender the static routes it can find and exit without actually launching the Fastify HTTP server.

[injected-requests]: https://www.fastify.io/docs/latest/Testing/#benefits-of-using-fastifyinject

### Dynamic routes

In order to statically generate dynamic routes, you need to be able to compose all possible paths to access them. You can do this by providing the `generatePaths()` function in <b>fastify-vite</b>'s plugin options. In this case, only the paths provided by this function will be considered for static generation.

::: tip
This is the equivalent of [generate.routes][generate-routes] in Nuxt.js and [getStaticPaths][getStaticPaths] in Next.js

[getStaticPaths]: https://nextjs.org/docs/basic-features/data-fetching#getstaticpaths-static-generation
[generate-routes]: https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-generate#routes
:::

If you have a `/pages/:page` route, for example:

```js
await app.register(fastifyVite, {
  generate: process.argv.includes('generate'),
  async generatePaths (add) {
    const pages = await getPagesTotalFromDataSource()
    for (let page = 1; page <= pages; page++) {
      add(`/pages/${page}`)
    }
  },
})
```

The `add()` helper function that is passed as first parameter is an _optional convenience_. You can create and return an array of routes yourself from `generatePaths()` if you want.


## Generate Server

<b>fastify-vite</b> also includes a built-in **live static generation server** — just set the `generateServer` option to `true` or pass a configuration object where you can set `port` and the `onGenerate` callback that gets called every time a new page gets regenerated, with a path to the updated file, so it can be uploaded to a different location if needed.

```js{9-14}
await app.register(fastifyVite, {
  generate: process.argv.includes('generate'),
  async generatePaths (add) {
    const pages = await getPagesTotalFromDataSource()
    for (let page = 1; page <= pages; page++) {
      add(`/pages/${page}`)
    }
  },
  generateServer: {
    port: 5000,
    onGenerate ({ path, file }) {
      // Upload assets
    }
  },
})
```

This would trigger an initial build and static generation but also start a server on `:5000` where you can do an HTTP `GET` to `/<path>` to trigger regeneration for that path in the build, without have to rebuild the entire application, i.e., this will keep regenerating pages based on the initial build.

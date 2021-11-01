
# Static Generation

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

In order to statically generate dynamic routes, you need to be able to compose all possible paths to access them. You can do this by providing the `paths()` function in <b>fastify-vite</b>'s plugin options. In this case, only the paths provided by this function will be considered for static generation.

::: tip
This is the equivalent of [generate.routes][generate-routes] in Nuxt.js and [getStaticPaths][getStaticPaths] in Next.js

[getStaticPaths]: https://nextjs.org/docs/basic-features/data-fetching#getstaticpaths-static-generation
[generate-routes]: https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-generate#routes
:::

If you have a `/pages/:page` route, for example:

```js
await app.register(fastifyVite, {
  generate: process.argv.includes('generate'),
  async paths (add) {
    const pages = await getPagesTotalFromDataSource()
    for (let page = 1; page <= pages; page++) {
      add(`/pages/${page}`)
    }
  },
})
```

The `add()` helper function that is passed as first parameter is an _optional convenience_. You can create and return an array of routes yourself from `paths()` if you want.


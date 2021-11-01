---
sidebarDepth: 3
---

# Generate Server

<b>fastify-vite</b> also includes a built-in **live static generation server** — just set the `generate.server.enabled` option to `true` or pass a configuration object where you can set `port` and the `generated` callback that gets called every time a new page gets regenerated, with a path to the updated file, so it can be uploaded to a different location if needed.

```js{11-21}
await app.register(fastifyVite, {
  generate: {
    // This option is actually set by default
    enabled: process.argv.includes('generate'),
    async paths (add) {
      const pages = await getPagesTotalFromDataSource()
      for (let page = 1; page <= pages; page++) {
        add(`/pages/${page}`)
      }
    },
    server: {
      // This option is actually set by default
      enabled: process.argv.includes('generate-server'),
      // This option is actually set by default
      port: 5000,
      generated ({ url, path, html }) {
        // url — the application's path that was regenerated
        // path — the path to the new file created on disk
        // html — raw HTML string generated
      }
    },
  },
})
```

This would trigger an initial build and static generation but also start a server on `:5000` where you can **do an HTTP `GET` to `/<path>` to trigger regeneration for that path in the build**, without having to rebuild the entire application, i.e., this will keep regenerating pages based on the initial build.

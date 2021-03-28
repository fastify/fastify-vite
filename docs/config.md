# Config

**fastify-vite** tries to intefere as little as possible in configuring your
Vite apps. So if you want to just have `vite.config.js` for all Vite settings,
that will just work as expected. However, you can also use the `vite` key.

Below is the top of the internal `options.js`, which lists all defaults too.

```js
// Used to determine whether to use Vite's dev server or not
const dev = process.env.NODE_ENV !== 'production'

const defaults = {
  dev,
  // Used to determine the keys to be injected in the application's boot
  // For Vue 3, that means adding them to globalProperties
  hydration: {
    global: '$global',
    data: '$data',
  },
  // Vite root app directory, whatever you set here
  // is also set under `vite.root` so Vite picks it up
  root: process.cwd(),
  // App's entry points for generating client and server builds
  entry: {
    // This differs from Vite's choice for its playground examples,
    // which is having entry-client.js and entry-server.js files on
    // the same top-level folder. For better organization fastify-vite
    // expects them to be grouped under /entry
    client: '/entry/client.js',
    server: '/entry/server.js'
  },
  // Any Vite configuration option set here
  // takes precedence over <root>/vite.config.js
  vite: {
    // Vite's logging level
    logLevel: dev ? 'error' : 'info',
    // Vite plugins needed for Vue 3 SSR to fully work
    plugins: [
      vuePlugin(),
      vueJsx()
    ],
    // Base build settings, default values
    // for assetsDir and outDir match Vite's defaults
    build: {
      assetsDir: 'assets',
      outDir: 'dist',
      minify: !dev,
    },
  }
}
```

[**See all available configuration options for Vite**](https://vitejs.dev/config/).

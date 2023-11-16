
### Vite's project root

The [**project root**](https://vitejs.dev/guide/#index-html-and-project-root) of your Vite application is treated like a module, so by default, **`@fastify/vite`** will try to load `<project-root>/index.js`. If you're coming from the SSR examples from the [Vite playground](https://github.com/vitejs/vite/tree/main/packages/playground), this is the equivalent of the **server entry point**. 

This is why it's also recommended you keep your client application source code **separate** from server files. In the `vite.config.js` previously shown, the project **root** is set as `client`.

So in `server.js`, the `root` configuration option determines where your `vite.config.js` is located. But in `vite.config.js` itself, the `root` configuration option determines your **project root** in Vite's context. That's what's treated as a module by **`@fastify/vite`**.

It's very important to understand those subtleties before getting started.

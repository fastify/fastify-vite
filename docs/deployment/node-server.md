# Node.js Server

Deploying a Fastify application involves generally the same steps in [deploying any Node.js application](https://www.google.com/search?q=deploying+node.js) to production — copy code to server, `npm install` dependencies and run (`node server.js`). 

A few things to keep in mind:

- Try and follow Fastify's [deployment recommendations](https://www.fastify.io/docs/latest/Recommendations/).
- Your Vite application <b>must be bundled</b> before it can be served in production. After the build, your application bundle will be available in `./dist` (default).

- Be mindful about Vite's settings, such as [build.outDir][out-dir] (`./dist`) and [build.assetsDir][assets-dir] (`assets`).

[out-dir]: https://vitejs.dev/config/#build-outdir
[assets-dir]: https://vitejs.dev/config/#build-assetsdir

- If you accidentally set `dev` to `true` in your <b>fastify-vite</b> plugin settings, you'll be using Vite's development server instead of the live rendering handler provided by your chosen framework (via the [renderer adapter](/concepts/renderer-adapters)). Vite's development server is <b>automatically turned off</b> in case the `NODE_ENV` environment variable is set to `production` when the application boots.

Anything beyond that is likely related to the particular server platform you're deploying to.

You'll need **Node v14+**.

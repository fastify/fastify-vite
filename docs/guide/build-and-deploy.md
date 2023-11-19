<!--@include: ./parts/links.md-->
<!--@include: ./parts/notice.md-->

## Deployment

If you try to run any of the [`examples/`](https://github.com/fastify/fastify-vite/tree/dev/examples) without the `--dev` flag, you'll be greeted with an error message:

```
% node server.js
/../node_modules/@fastify/vite/mode/production.js:6
    throw new Error('No distribution bundle found.')
          ^

Error: No distribution bundle found.
```

This means you're trying to run **`@fastify/vite`** in production mode, in which case a **distribution bundle** is assumed to exist. To build your client application code in preparation for **`@fastify/vite`**, you must run two `vite build` commands, one for the actual client bundle, that gets delivered to the browser, and another for the server-side version of it (what **`@fastify/vite`** sees as the *_client module_*, or *_server entry point_*).

Assuming you're using the default `clientModule` resolution (`/index.js`), these are the `scripts` needed in `package.json`:

```json
"build": "npm run build:client && npm run build:server",
"build:client": "vite build --outDir dist/client --ssrManifest",
"build:server": "vite build --outDir dist/server --ssr /index.js",
```

After running `npm run build` on [`react-vanilla`](https://github.com/fastify/fastify-vite/tree/dev/examples/react-vanilla), for example, you should see a new `client/dist` folder.


```diff
  ├── client
+ │    ├── dist
  │    ├── base.jsx
  │    ├── index.html
  │    ├── index.js
  │    └── mount.js
  ├── package.json
  ├── server.js
  └── vite.config.js
```

That's where the production bundle of your Vite application is located, so this folder needs to exist before you can run a Fastify server with **`@fastify/vite`** in production mode.

Also note that in **production mode**, **`@fastify/vite`** will serve static assets from your Vite application via [`@fastify/static`](https://github.com/fastify/fastify-static) automatically, but you should consider using a CDN for those files if you can, or just serve through Nginx  instead of directly through Node.js. A detailed guide on how to set this up will be added soon.


If you don't need SSR, it can also just serve as a convenience to serve your static Vite bundle through Fastify via [@fastify/static][fastify-static], automatically inferring your bundle's output directory from your Vite configuration file, and still allowing you to leverage Vite's development server for hot reload.

::: warning
**Don't serve static assets via Node.js in production**! Override static asset requests to a web server such as [NGINX](https://www.nginx.com/) or use [Vite's advanced base options](https://vitejs.dev/guide/build.html#advanced-base-options) to configure a CDN.
:::

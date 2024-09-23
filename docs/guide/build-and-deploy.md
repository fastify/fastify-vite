<!--@include: ./parts/links.md-->
<!--@include: ./parts/notice.md-->

# Build and Deploy

You'll quickly notice running your Fastify server without the `--dev` flag can get you the following error message:

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
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build --outDir dist/client --ssrManifest",
    "build:server": "vite build --outDir dist/server --ssr /index.js",
  }
}
```

If you're using a **different** [`clientModule`](/config/#clientmodule) settings, you *will* need to change the `build:server` command accordingly, i.e., that's not taken care of by `**@fastify/vite**`. After running `npm run build` on [`react-vanilla`](https://github.com/fastify/fastify-vite/tree/dev/examples/react-vanilla), for example, you should see a new `client/dist` folder.

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

That's where the production bundle of your Vite application is located, so this folder needs to exist before you can run a Fastify server with **`@fastify/vite`** in production mode. Once you have `client/dist` available, `node server.js` without the `--dev` flag should be able to run.

> Make sure to have `NODE_ENV` set to `production` as well in case your framework requires it (like React) for SSR in production as well. Accidentally running React SSR in development mode is quite common and can lead to serious performance degradation.

Also note that in **production mode**, **`@fastify/vite`** will serve static assets from your Vite application via [`@fastify/static`](https://github.com/fastify/fastify-static) automatically, but you should consider using a CDN for those files if you can, or just serve through Nginx  instead of directly through Node.js.

If you don't need SSR, it can also just serve as a convenience to serve your static Vite bundle through Fastify via [@fastify/static][fastify-static], automatically inferring your bundle's output directory from your Vite configuration file, and still allowing you to leverage Vite's development server for hot reload.

## Steps

To recap, the steps to build and deploy are:

- Running vite build with client configuration.
- Running vite build with server configuration.
- Including `client/dist` as part of your deployment.
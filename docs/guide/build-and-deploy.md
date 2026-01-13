<!--@include: ./parts/links.md-->
<!--@include: ./parts/notice.md-->

# Build and Deploy

Without building, you will quickly notice running your Fastify server without the `--dev` flag can get you the following error message:

```
% node server.js
/../node_modules/@fastify/vite/mode/production.js:6
    throw new Error('No distribution bundle found.')
          ^

Error: No distribution bundle found.
```

This means you're trying to run **`@fastify/vite`** in production mode, in which case a **distribution bundle** is assumed to exist. You need to first build your application code in preparation for **`@fastify/vite`**.

## Building multiple bundles

Depending on your application, there can be up to _three_ distribution bundles:

1. The bundle that gets delivered to the **browser**. Required no matter what.
2. The bundle used for **server side rendering** (SSR). Only required if you intend to use server side rendering.
3. The "bundle" that contains the code that instantiates the **Fastify server itself**. Some servers need this, such as ones that are written in TypeScript and do not want to use type-stripping. This build process is entirely up to you.

Building the **browser bundle** and the **ssr bundle** can be accomplished by running a single `vite build` command. Their entry points are as follows:

```text{2,3}
├── client/
│    ├── index.js <-- ssr entry point (default)
│    ├── mount.js <-- browser entry point
│    └── index.html
```

You can use the included Vite plugin to customize the SSR build:

```js{7}
import { resolve } from 'node:path'
import viteFastify from '@fastify/vite/plugin'

export default {
  root: resolve(import.meta.dirname, 'client'),
  plugins: [
    viteFastify({/* see below for available options */})
  ],
}
```

The `viteFastify` plugin can be given the following options:

- `spa` - Set this to `true` to disable the SSR build entirely. Default: `false`.
- `clientModule` - The location of the SSR entry point, relative to the index.html file. Defaults to `index.js`. You can also use an absolute path to be extra safe.

Note: All paths in the generated `vite.config.json` are relative to the application root directory (where `package.json` is located). This ensures hermetic builds that work across different machines (e.g., building locally and deploying to Docker).

Assuming you do not need to build your Fastify server itself, the only build script you need in your `package.json` file is below:

```json{3}
{
  "scripts": {
    "build": "vite build"
  }
}
```

If you **do** need to run a custom build process on the code that instantiates the Fastify server itself, your `package.json` file likely contains the scripts below:

```json{5}
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc",
  }
}
```

In the example above, `tsc` is used as the custom build process for the server code, but this can be replaced with whatever you need to use. If you do this, you probably want to customize the location of your dist directory (see below).

### The dist directory

The `vite build` script above creates a `dist` directory with the following contents:

```text
├── dist/
│    ├── client/  (contains client bundle)
│    └── server/  (contains ssr bundle, if enabled)
```

Depending on whether you have decided to use a `src` directory, you may also want to customize where your `dist` directory is located. This especially true if you have a custom build process for your server code. Common locations for the `dist` directory can be:

1. Within the client folder, aka the location specified as the `root` of your `vite.config.js` file. This is the default and is recommended if you do not run a custom build for your server code.
2. At the root of the application. If you run a custom build for your server code, it generally builds into a dist folder that is a sibling to your `src` directory. In this case, you likely want to put your client and SSR bundles into this folder as well.

If you choose to go with (2), your `dist` folder should also contain the built server files at its root level:

```diff
  ├── dist/
  │    ├── client/    (contains client bundle)
  │    ├── server/    (contains ssr bundle, if enabled)
+ |    └── server.js  (the built server files)
```

To achieve this, you need to do two things:

1. Instruct the included `viteFastify` plugin to output its files into your custom `dist` directory location using vite's [`build.outDir`](https://vite.dev/config/build-options.html#build-outdir) option.
2. Instruct your custom build process to output the built server files into the same `dist` directory.

If you do not do the above two steps, you could end up with two separate `dist` folders that you will need to handle on your own. Below is an example of this setup using `tsc` as the custom server build process:

::: code-group

```js{7} [vite.config.js]
import { resolve } from 'node:path'
import viteFastify from '@fastify/vite/plugin'

export default {
  root: resolve(import.meta.dirname, 'client'),
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
  },
  plugins: [
    viteFastify()
  ],
}
```

```json{3} [tsconfig.json]
{
  "compilerOptions": {
    "outDir": "dist"
  }
}
```

:::

## Running in production mode

Once your build processes are complete and your `dist` directory is populated, you should be able to run a Fastify server with **`@fastify/vite`** in production mode. Run `node server.js` without the `--dev` flag to see. Don't forget to include your `dist` directory as part of your deployment.

> Make sure to have `NODE_ENV` set to `production` as well in case your framework requires it (like React) for SSR in production as well. Accidentally running React SSR in development mode is quite common and can lead to serious performance degradation.

Also note that in **production mode**, **`@fastify/vite`** will serve static assets from your Vite application via [`@fastify/static`](https://github.com/fastify/fastify-static) automatically, but you should consider using a CDN for those files if you can, or just serve through Nginx instead of directly through Node.js.

If you don't need SSR, it can also just serve as a convenience to serve your static Vite bundle through Fastify via [@fastify/static][fastify-static], automatically inferring your bundle's output directory from your Vite configuration file, and still allowing you to leverage Vite's development server for hot reload.

> Tip: If you are using Docker, your final `CMD` should be `node server.js` and not `npm run anything`. This will allow SIGTERM signals to be sent directly to the `node` process and not an intermediary `npm` process which usually fails to forward the messages properly to `node`.

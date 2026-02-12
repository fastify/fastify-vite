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

### Finding vite.config.json at runtime

At runtime, **`@fastify/vite`** automatically locates your application root (by finding the nearest `package.json`, starting from the location of your `vite.config.js` file) then searches for `vite.config.json` in these standard locations (checking `dist/` first, then `build/`):

1. `dist/vite.config.json` or `build/vite.config.json`
2. One level deeper (e.g., `dist/client/vite.config.json`)
3. `client/dist/vite.config.json` or `client/build/vite.config.json`

If you use a different folder name (e.g., `out` or `output`), you must specify the `distDir` option:

```js
import { resolve } from 'node:path'

await server.register(FastifyVite, {
  root: import.meta.dirname, // the search for package.json begins here
  distDir: 'output',
})
```

**Note:** If you pass an absolute path to `distDir`, no searching will happen and we will directly look for `vite.config.json` inside your given absolute path only.

## Running in production mode

Once your build processes are complete and your `dist` directory is populated, you should be able to run a Fastify server with **`@fastify/vite`** in production mode. Run `node server.js` without the `--dev` flag to see. Don't forget to include your `dist` directory as part of your deployment.

> Make sure to have `NODE_ENV` set to `production` as well in case your framework requires it (like React) for SSR in production as well. Accidentally running React SSR in development mode is quite common and can lead to serious performance degradation.

Also note that in **production mode**, **`@fastify/vite`** will serve static assets from your Vite application via [`@fastify/static`](https://github.com/fastify/fastify-static) automatically, but you should consider using a CDN for those files if you can, or just serve through Nginx instead of directly through Node.js. You can customize the underlying `@fastify/static` options (e.g., `preCompressed`, `maxAge`, `setHeaders`) via [`fastifyStaticOptions`](/config/#fastifystaticOptions).

If you don't need SSR, it can also just serve as a convenience to serve your static Vite bundle through Fastify via [@fastify/static][fastify-static], automatically inferring your bundle's output directory from your Vite configuration file, and still allowing you to leverage Vite's development server for hot reload.

> Tip: If you are using Docker, your final `CMD` should be `node server.js` and not `npm run anything`. This will allow SIGTERM signals to be sent directly to the `node` process and not an intermediary `npm` process which usually fails to forward the messages properly to `node`.

## Serving assets from a CDN

For high-traffic applications, serving static assets from a CDN (Content Delivery Network) significantly reduces load on your origin server and improves load times for users worldwide.

### Push-based CDN (`baseAssetUrl`)

Use the `baseAssetUrl` option to rewrite asset URLs in your HTML to point to your CDN:

```js
await server.register(FastifyVite, {
  root: import.meta.url,
  baseAssetUrl: process.env.CDN_URL,
})
```

With `CDN_URL=https://cdn.example.com`, your HTML output changes from:

```html
<script type="module" src="/assets/main-abc123.js"></script>
<link rel="stylesheet" href="/assets/style-def456.css" />
```

To:

```html
<script type="module" src="https://cdn.example.com/assets/main-abc123.js"></script>
<link rel="stylesheet" href="https://cdn.example.com/assets/style-def456.css" />
```

### How it works

The `baseAssetUrl` option replaces Vite's [`base`](https://vite.dev/config/shared-options.html#base) path in your HTML output with the CDN URL. If your Vite `base` is `/` (the default), asset paths like `/assets/main.js` become `https://cdn.example.com/assets/main.js`. If you've configured a custom base like `/app/`, then `/app/assets/main.js` becomes `https://cdn.example.com/assets/main.js`.

The URL transformation happens **once at server startup** when loading `index.html` from your dist folder. This means:

- **No per-request overhead** - the HTML is pre-transformed
- **Runtime flexibility** - different CDN URLs per environment without rebuilding
- **Local fallback** - `@fastify/static` routes remain registered, so assets can still be served locally if needed

### What gets transformed

All standard asset references in your HTML are rewritten:

- `<script src="...">`
- `<link href="...">`
- `<img src="...">` and `<img srcset="...">`
- `<video src="...">` and `<video poster="...">`
- `<audio src="...">`
- `<source src="...">` and `<source srcset="...">`

External URLs (`https://...`, `http://...`) and data URLs (`data:...`) are preserved as-is.

### Deploying your assets

You'll need to upload your built assets to your CDN. The files to upload are in your `dist/client/` directory (or wherever your Vite build outputs client assets). Common approaches:

1. **CI/CD pipeline** - Upload assets to S3/CloudFront, GCS, or your CDN of choice during deployment
2. **CDN pull** - Configure your CDN to pull from your origin server on cache miss
3. **Build-time upload** - Add a post-build script to sync assets to your CDN

Example using AWS S3:

```bash
# After vite build
aws s3 sync dist/client/ s3://my-bucket/assets/ --cache-control "public,max-age=31536000,immutable"
```

Since Vite adds content hashes to filenames (e.g., `main-abc123.js`), you can use aggressive caching headers.

### Pull-based CDN (origin pull)

If your CDN sits in front of your origin server (Cloudflare, CloudFront origin pull, Fastly), requests for static assets are intercepted automatically. No URL rewriting is needed, so `baseAssetUrl` doesn't apply here.

Use [`fastifyStaticOptions`](/config/#fastifystaticOptions) to control the `Cache-Control` headers your origin sends. The CDN uses these headers to determine how long to cache each asset:

```js
await server.register(FastifyVite, {
  root: import.meta.url,
  fastifyStaticOptions: {
    maxAge: 31536000,
    immutable: true,
  },
})
```

This sends `Cache-Control: public, max-age=31536000, immutable` on all static asset responses.

For more granular control, use `setHeaders` to vary cache policy by file type or add CDN-specific headers:

```js
await server.register(FastifyVite, {
  root: import.meta.url,
  fastifyStaticOptions: {
    setHeaders(res, path) {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache')
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      }
    },
  },
})
```

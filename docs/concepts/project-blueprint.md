
# Project Blueprint

<b>fastify-vite</b> started off from the [official SSR examples](https://github.com/vitejs/vite/tree/main/packages/playground/) in Vite's playground. It evolved from the original vanilla Express setup to a modular Fastify plugin with pluggable [renderer adapters](/concepts/renderer-adapters), employed to ensure it can work with any framework (right now Vue 3+ and React 17+ are supported). 

A <b>fastify-vite</b> application will always begin with a JavaScript file that looks roughly like this:

```js
import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import renderer from '<renderer-adapter>'

const app = Fastify()
await app.register(FastifyVite, { renderer, root: import.meta.url })
await app.vite.ready()
```

Where `<renderer-adapter>` varies according to what framework you're using.

In <b>fastify-vite</b>'s examples, this file is always called `server.js` but you of course may name it anything you like, as long as it doesn't clash with the **blueprint reserved names**. More on that in a bit.

## Basic Structure

These are the core files of a <b>fastify-vite</b> application:

<div style="
  background: #191919; 
  padding: 1.4em; 
  border-radius: 5px !important;
  margin-top: 1em;"><code>├─ entry/<br>
│  ├─ client.js<br>
│  └─ server.js<br>
├─ index.html<br>
├─ routes.js<br>
└─ client.js<br>
</code>
</div>

In a nutshell, you have the main `index.html`, the client and server entry points, and `client.js` (not to be confused with `entry/client.js`) which is expected to export the `createApp` function that returns an instance of your app's main component.

::: tip
The `index.html` file is [required by Vite][vite-index-html] as it is the main entry point for dependency resolution. 

[vite-index-html]: https://vitejs.dev/guide/#index-html-and-project-root

Vite actually supports [multiple entry points](https://vitejs.dev/guide/build.html#multi-page-app), but for a SSR app, having a central entry point that can serve as shell for any view is typically enough — and that is the setup <b>fastify-vite</b> builds upon.<br>
:::

The client entry point — `entry/client.js` — is responsible for mounting the app to a DOM element (on the browser, after the document has been delivered).

The server entry point — `entry/server.js` — is responsible for providing the server-side rendering function for the app. To visualize this more clearly, study the [ssr-html](https://github.com/vitejs/vite/tree/main/packages/playground/ssr-html) example.

The `routes.js` file is shared between `client.js` and `entry/server.js` — the former needs it to set up the client router and the latter needs it to provide the routes to the server, so it can set up an individual Fastify route for each of the client routes that you have. See more in [Integrated Routing](/concepts/integrated-routing).

## Magic @app/ Imports

In an attempt to **reduce the required boilerplate** to run, <b>fastify-vite</b> renderer adapters are packed with with the default **blueprint** of a simple application, which may vary depending on the framework supported, but has roughly the same elements listed above. 

When you run your <b>fastify-vite</b> application for the first time (`node <app>`), **it will automatically create <b>index.html</b> from you**, picking it up directly from the renderer adapter you're using. As one would expect this happens only when it doesn't find an existing file already.

For `index.html`, this behavior is handled by <b>fastify-vite</b> itself, but every other file is handled cleanly by [vite-plugin-blueprint](https://github.com/terixjs/vite-plugin-blueprint). With this Vite plugin, used internally by the official renderer adapters, **the @app import prefix is made available, serving as a smart loader for files**:

<div style="border-radius: 5px !important; background: #191919; padding: 1.4em; margin-top: 1em;"><code>
import client from '@app/client.js'
</code></div>

When Vite sees this import, it will first look for `client.js` in the root directory of your application. If the file is missing, it will provide the one the from the renderer's base folder. This is valid for every file you find in a renderer adapter's base folder — these are the **blueprint files**. The blueprint files vary depending on the renderer adapter (and framework supported). 

Here's what the setup looks like for <b>fastify-vite-vue</b>:

<div style="
  background: #191919; 
  padding: 1.4em; 
  border-radius: 5px !important;
  margin-top: 1em;"><pre style="padding: 0; margin: 0"><code>├─ server.js
├─ index.html
└─ node_modules/
   └─ fastify-vite-vue/
      └─ base/
         ├─ entry/
         │  ├─ client.js
         │  └─ server.js
         ├─ routes.js
         ├─ head.js
         └─ client.js
</code></pre>
</div>

So what you see in the root directory may just be `index.html` and `server.html`, but the application is booting with all the files from the renderer adapter's base folder. To override any of the files, just place a file with the same name at the root directory, and that will be used instead.

You can also turn off blueprint files entirely by providing your own `vite.config.js` without `vite-plugin-blueprint`. You can start off with the original from your renderer adapter:

```bash
cp node_modules/fastify-vite-vue/vite.js vite.config.js
cp node_modules/fastify-vite-react/vite.js vite.config.js
```

If you do this (remove `vite-plugin-blueprint`), you're required to provide base files for your application yourself, namely, the client and server entry points, and all their dependencies.

You can also use the `eject` command to extract all files from the renderer adapter `base` folder into your application's root directory, make it easy to tweak things. You'll want to do this at the outset of development if you know you'll be heavily customizing them.


<div style="
  background: #191919; 
  padding: 1.4em; 
  border-radius: 5px !important;
  margin-top: 1em;"><pre style="padding: 0; margin: 0"><code>node &lt;app&gt; eject</code></pre>
</div>


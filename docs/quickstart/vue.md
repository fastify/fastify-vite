
# Vue 3

First create a <b>package.json</b> file if you don't have one yet. 

<div style="background: #191919; padding: 1.4em; border-radius: 5px !important;"><code>
echo {} > package.json<br>
</code></div>

This will ensure dependencies you install via `npm install` are recorded in it. 

Then install [fastify](), [fastify-vite]() and [fastify-vite-vue]():

<div style="background: #191919; padding: 1.4em; border-radius: 5px !important;"><code>
npm i fastify fastify-vite fastify-vite-vue --save
</code></div>

## Minimal Boilerplate

Highlighted in the snippet below are <b>fastify-vite</b>'s required options, `renderer` and `root`. The first is the [renderer adapter]() and the second is [Vite's application root](https://vitejs.dev/config/#root).

All examples in the documentation use [ESM][esm], but it's not required. If you use CJS, use `__dirname` instead of `import.meta.url` when setting the `root` option. It will know the difference.

```js{5,6}
import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import FastifyViteVue from 'fastify-vite-vue'

const root = import.meta.url
const renderer = FastifyViteVue

const app = Fastify()
await app.register(FastifyVite, { root, renderer })

const address = await app.listen(3000)

console.log(`Listening at ${address}`)
```

[esm]: https://nodejs.org/api/esm.html

Assuming you have saved the snippet above as `app.mjs`:

<div style="background: #191919; padding: 1.4em; border-radius: 5px !important;"><code>
node app.mjs
</code></div>

Vite applications [are required to have an <b>index.html</b> file][vite-index-html] at the root. 

When you run your <b>fastify-vite</b> application for the first time (`node app.mjs`), **it will automatically create <b>index.html</b> from you**, picking it up directly from the renderer adapter you're using. That is in the event it doesn't find one already, of course. This is what it looks like:

[vite-index-html]: https://vitejs.dev/guide/#index-html-and-project-root

```html
<!DOCTYPE html>
<html>
<head>
${head.preload}
${head.tags}
</head>
<body>
${hydration}
<div id="app">${element}</div>
<script type="module" src="@app/entry/client.js"></script>
</body>
</html>
```

As you can probably imagine, these variable names cannot be changed because they are used by <b>fastify-vite-vue</b>'s internal rendering functions. The contents of <b>index.html</b> itself are compiled into a function loaded into memory for maximum performance.

## Recognized Commands

<table class="infotable"><tr><td style="width: 20%">
<code class="h inline-block">node &lt;app&gt; build</code></td>
<td>
Builds the Vite application (creates a bundle).
</td></tr><tr><td>
<code class="h inline-block">node &lt;app&gt; generate</code></td>
<td>
Builds the Vite application (creates a bundle) <b>with prerendered pages</b>.
<br><br>See <a href="">Static Generation</a> for more details.
</td></tr><tr><td>
<code class="h inline-block">node &lt;app&gt; generate-server</code></td>
<td>
Builds the Vite application (creates a bundle) <b>with prerendered pages</b>.
<br><br><b>Also starts a Fastify server that accepts API requests to trigger static generation of pages on demand</b>.
<br><br>See <a href="">Generate Server</a> for more details.
</td></tr></table>


## Blueprint Files

The fastify-vite-vue package will provide nearly all your starting boilerplate, the snippet above, where you actually register fastify-vite in your Fastify application, being the only exception you're expected to provide yourself. The files provided by fastify-vite-vue are listed below.

<table class="infotable"><tr><td>
<code class="h inline-block">client.js</code></td>
<td>Must export a <code>createApp</code> function <b>returning a Vue application instance</b>.
</td></tr><tr><td>
<code class="h inline-block">client.vue</code></td>
<td>Must export the <b>main Vue component for your app</b>.
<br><br>That would be the one where you set a layout, a router view etc.
</td></tr><tr><td>
<code class="h inline-block">fastify</code></td>
<td>the Fastify server instance — only available on the server
</td></tr><tr><td>
<code class="h inline-block">$global</code></td>
<td><a href="/guide/global-data">Global Data</a> — available isomorphically
</td></tr><tr><td>
<code class="h inline-block">$payload</code></td>
<td><b>Route Payload data</b> — available isomorphically
</td></tr><tr><td>
<code class="h inline-block">$payloadPath()</code></td>
<td><b>Route Payload endpoint</b> — available isomorphically
</td></tr><tr><td>
<code class="h inline-block">$data</code></td>
<td><b>Route Isomorphic Data</b> — available isomorphically
</td></tr></table>


<code>npm install</code> — will install <code>fastify</code>, <code>vite</code>, <code>fastify-vite</code> etc from <code>package.json</code>

<code>npm run dev</code> — for running your app with Fastify + Vite's development server

<code>npm run build</code> — for [building](/guide/deployment.html) your Vite application

<code>npm run start</code> — for serving in production mode

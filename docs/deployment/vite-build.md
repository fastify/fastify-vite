# Vite Build

Before you can deploy to production, you need to bundle your code through Vite.

To be more specific, you need to bundle your <b>client</b> and <b>server</b> entry points.

In a vanilla Vite app, that means having to run two build commands:

<div style="
  background: #191919; 
  padding: 1.4em; 
  border-radius: 5px !important;
  margin-top: 1em;"><code>
vite build --ssrManifest --outDir dist/client<br>
vite build --ssr entry/server.js --outDir dist/server
</code></div>

Check out [Vite's SSR Guide][ssr-guide] for in-depth details. 

[ssr-guide]: https://vitejs.dev/guide/ssr

In <b>fastify-vite</b> apps, you can just use the `build` command that is added to the app automatically:

<div style="
  background: #191919; 
  padding: 1.4em; 
  border-radius: 5px !important;
  margin-top: 1em;"><code>
node &lt;app&gt; build
</code></div>

This command will use Vite's API to trigger the builds for both client and server bundles, and prevent the Fastify server from starting. See [Built-in Commands](/concepts/builtin-commands) for more details.
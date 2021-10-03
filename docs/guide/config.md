
# Configuration

Most configuration options are covered in the sections relating to them.

Below is a quick reference of all options and their default values.

## General

<table class="infotable">
<tr>
<td width="40%">
<code class="h inline-block">dev</code>
<br>
<br>
<span class="small">Whether or not to run Vite's development server</span>
</td>
<td>
<code><b>process.env.NODE​&lowbar;ENV !== 'production'</b></code>
</td>
</tr>
<tr>
<td>
<code class="h inline-block">root</code>
<br><br>
<span class="small">The Vite client app's source root</span>
</td>
<td>
<code><b>process.cwd()</b></code>
</td>
</tr>
<tr>
<td>
<code class="h inline-block">renderer</code>
<br><br>
<span class="small"><a href="/internals/renderer-api">Renderer adapter</a></span>
</td>
<td>
<code>No default value</code>
</td>
</tr>
</table>

## Hydration

<table class="infotable">
<tr>
<td width="40%">
<code class="h inline-block">hydration.global</code>
<br><br>
<span class="small"><a href="/guide/global-data">Global Data</a> hydration key</span>
</td>
<td>
<code>'$global'</code>
</td>
</tr>
<tr>
<td>
<code class="h inline-block">hydration.payload</code>
<br><br>
<span class="small"><a href="/guide/data-fetching.html#route-payloads">Route Payload</a> hydration key</span>
</td>
<td>
<code>'$payload'</code>
</td>
</tr>
<tr>
<td>
<code class="h inline-block">hydration.data</code>
<br><br>
<span class="small"><a href="/guide/data-fetching.html#isomorphic-data">Isomorphic Data</a> hydration key</span>
</td>
<td>
<code>'$data'</code>
</td>
</tr>
</table>

## Deployment

<table class="infotable">
<tr>
<td width="40%">
<code class="h inline-block">build</code>
<br><br>
<span class="small">If <code>true</code>, <a href="/guide/deployment.html#running-vite-build">triggers Vite build</a> and exits</span>
</td>
<td>
<code>process.argv.includes('build')</code><br><br>
<span class="smallp">Enables <code><b>node app.js build</b></code> by default</span>
</td>
</tr>
<tr>
<td>
<code class="h inline-block">generate.enabled</code>
<br><br>
<span class="small">If <code>true</code>, <a href="/guide/deployment.html#running-vite-build">triggers Vite build</a> with prerendered paths included (<a href="/guide/deployment.html#static-generation">static generation</a>) and exits</span>
</td>
<td>
<code>process.argv.includes('generate')</code><br><br>
<span class="smallp">Enables <code><b>node app.js generate</b></code> by default</span>
</td>
</tr>
<tr>
<td>
<code class="h inline-block">generate.server.enabled</code>
<br><br>
<span class="small">If <code>true</code>, <a href="/guide/deployment.html#running-vite-build">triggers Vite build</a> with prerendered paths included (<a href="/guide/deployment.html#static-generation">static generation</a>) and starts the live <a href="/guide/deployment.html#generate-server">static generation server API</a></span>
</td>
<td>
<code>process.argv.includes('generate-server')</code><br><br>
<span class="smallp">Enables <code><b>node app.js generate-server</b></code> by default</span>
</td>
</tr>
<tr>
<td>
<code class="h inline-block">generate.server.generated</code>
<br><br>
<span class="small">Callback function called when an URL gets generated (or regenerated) via the live <a href="/guide/deployment.html#generate-server">static generation server API</a></span>
</td>
<td>
<code>No default value</code><br><br>
</td>
</tr>
</table>

## Vite

As [explained in Vite's documentation](https://vitejs.dev/guide/ssr.html#source-structure), a Vite SSR application requires you to build both a [client](https://vitejs.dev/guide/#index-html-and-project-root) and a [server](https://vitejs.dev/guide/ssr.html#building-for-production) bundle. Since <b>fastify-vite</b> makes your Fastify server recognize `build` and `generate` commands, it also lets you configure <b>client</b> and <b>server</b> entry points. 

::: tip
In plain Vite SSR projects, the server entry point is not something you configure, but rather pass in to Vite's `build` CLI command, while the client entry point is the main JavaScript file you reference from index.html — even though the official documentation refers to index.html as the entry point of your app. This is probably because the generated `index.html` is what is delivered to the browser <b>if you're not performing SSR</b> — but if you are, it gets replaced by what is dynamically generated (SSR) from the server.
:::

<table class="infotable">
<tr>
<td width="40%">
<code class="h inline-block">entry.server</code>
<br><br>
<span class="small">Vite server entry point</span>
</td>
<td>
<code>Default value provided by <b>renderer adapter</b></code><br><br>
<code>Conventionally set as <b>/entry/server.&lt;extension&gt;</b></code>
</td>
</tr>
<tr>
<td>
<code class="h inline-block">entry.client</code>
<br><br>
<span class="small">Vite client entry point</span>
</td>
<td>
<code>Default value provided by <b>renderer adapter</b></code><br><br>
<code>Conventionally set as <b>/entry/client.&lt;extension&gt;</b></code>
</td>
</tr>
</table>

<b>fastify-vite</b> tries to intefere as little as possible in configuring your Vite apps. 

So if you want to just have `vite.config.js` for all Vite settings, that will just work as expected.

However, you can also use the `vite` option:

<table class="infotable">
<tr>
<td width="40%">
<code class="h inline-block">vite</code>
<br><br>
<span class="small"><a href="https://vitejs.dev/config/">Vite configuration</a> options</span>
</td>
<td>
<code>Default value provided by <b>renderer adapter</b></code>
</td>
</tr>
</table>

It is advised you use one or the other to avoid confusion.



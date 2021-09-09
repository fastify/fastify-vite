
# Configuration

**fastify-vite** tries to intefere as little as possible in configuring your
Vite apps. 

So if you want to just have `vite.config.js` for all Vite settings,
that will just work as expected. However, you can also use the `vite` key
when passing options to the `fastify.register()` call.

<table class="infotable">
<tr style="width: 100%">
<td style="width: 20%">
<strong>Plugin Options</strong>
<br><br><b>Rundown and default values</b>
</td>
<td class="code-h" style="width: 80%">
<code class="h inline-block">dev</code>
—— <code>process.env.NODE​&lowbar;ENV !== 'production'</code>
<br><br>
Whether or not to run Vite's development server.
<br><br>
<code class="h inline-block">root</code>
—— <code>process.cwd()</code>
<br><br>The Vite client app's source root, typically set to <code>__dirname</code>
<br><br>
<code class="h inline-block">renderer</code>
—— <b><code>no default value</code></b>
<br><br><a href="/internals/renderer-api">Renderer adapter</a>
(<code>fastify-vite-vue</code> or <code>fastify-vite-react</code>).
<br><br>
<code class="h inline-block">hydration.global</code>
—— <code>'$global'</code>
<br><br>
<code class="h inline-block">hydration.payload</code>
—— <code>'$payload'</code>
<br><br>
<code class="h inline-block">hydration.data</code>
 —— <code>'$data'</code>
<br><br>The Vite client app's source root, typically set to <code>__dirname</code>
<br><br>
<code class="h inline-block">entry.server</code>
 —— <code>default value provided by renderer adapter</code>
<br><br>The Vite client app's source root, typically set to <code>__dirname</code>
<br><br>
<code class="h inline-block">entry.client</code>
 —— <code>default value provided by renderer adapter</code>
<br><br>The Vite client app's client entry point
</td>
</tr>
</table>

See the internal `options.js` used by <b>fastify-vite</b> [here]().

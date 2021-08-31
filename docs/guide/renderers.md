# Modular Renderers

<style>
.small {
  font-size: 0.9em;
  color: #ec6f2d;
}
</style>

<b>fastify-vite</b> has a modular renderer API that aims to allow you to use it with any framework, as long as you provide _the right adapter_. Quoting the introductory example:

```js
const fastify = require('fastify')()
const fastifyVite = require('fastify-vite')
const renderer = require('fastify-vite-vue')

fastify.register(fastifyVite, { renderer })
```

The `renderer` plugin option is an object expected to contain the options associted with the framework renderer, plus functions to create a route handler for SSR (`getHandler`) and to load the application's entry file (`getEntry`), both for <b>dev</b> and <b>production</b> environments. 

<table style="display: table; width: 100%">
<tr style="width: 100%">
<td style="width: 20%">
<strong>Renderer</strong>
<br><br>
<span style="font-size: 0.7rem">
Key exports expected from a 
renderer adapter and their roles
</span>
</td>
<td class="code-h" style="width: 80%">
<code class="h inline-block">options</code>
—— Vite options for framework
<br><br>
<b class="small">These are used in development:</b>
<br><br>
<code class="h inline-block">dev.getHandler()</code>
—— Returns Vite + Fastify route handler for SSR
<br><br>
<code class="h inline-block">dev.getEntry()</code>
—— Returns Vite's entry points for the app
<br><br>
<b class="small">These are used when <code>NODE_ENV === 'production'</code></b>
<br><br>
<code class="h inline-block">getHandler()</code>
—— Returns production Fastify route handler for SSR
<br><br>
<code class="h inline-block">getEntry()</code>
—— Returns production entry points for the app
</td>
</tr>
</table>

In addition to providing the options and functions required to load and render the application from Fastify, a renderer adapter must include `client` and `server` modules. The server module must export a `createRenderFunction()` function 

<table style="display: table; width: 100%">
<tr>
<td>
<strong>Boot phase</strong>
<br><br>
<span style="font-size: 0.7rem">
With configuration loaded, Terix
proceeds to register ecosystem plugins,
internal plugins and app plugins, 
<b>in that order</b>.
</span>
</td>
<td class="code-h" style="width: 80%">
Next up:
<br><br><code class=h>node_modules/terix/server.js</code>:
loaded by <code>terix/cli.js</code> to start the server
<br><br><code class="h inline-block">node_modules/terix/ecosystem.js</code>:
registers and configures ecosystem plugins
<br><br><code class="h inline-block">server/boot.js</code>:
registers and configures internal Plugins
<br><br>Terix will load first all ecosystem plugins it includes by default,
then its own internal plugins, and finally your application's plugins. This
all happens before your routes are registered.
</td>
</tr>
<tr>
<td>
<strong>App phase</strong>
<br><br>
<span style="font-size: 0.7rem">
Once configuration and internal plugins
are loaded, Terix gets to your own plugins
and finally, your routes.
</span>
</td>
<td class="code-h" style="width: 80%">
Entries from <code>options.plugins</code> are automatically loaded from:
<br><br><code class=h>server/&lt;plugin-path&gt;.js</code>
<br><br>Middleware groups (if available) are loaded via:
<br><br><code class=h>server/middleware.js</code>
<br><br>Injections (if available) for route definitions are then loaded via:
<br><br><code class=h>server/injections.js</code>
<br><br>After that, routes themselves are loaded from:
<br><br><code class=h>server/routes/*.js</code>
<br><br><code class=h>server/routes/**/*.js</code>
<br><br>And optionally, from <code>options.setup()</code> or <code>server/setup.js</code>.
<br><br>Finally, <code>fastify.listen()</code> from <code>terix/server.js</code> runs and the app is running.
</td>
</tr>
</table>

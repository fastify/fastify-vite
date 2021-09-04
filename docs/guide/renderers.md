# Renderer API

<style>
.infotable {
  display: table;
  width: 100%;
  font-size: 0.8em;
}
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

<table class="infotable">
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

In addition to providing the options and functions required to load and render the application from Fastify, a renderer adapter must include `client` and `server` modules. The server module must export a `createRenderFunction()` function, and the client module must export, at the very least, the `isServer` flag, `useHydration()` and `hydrate()`. 

Depending on the framework and idioms employed, other helpers might be added. For instance, the <b>React Renderer</b> includes a `ContextProvider` export, while the <b>Vue Renderer</b> includes a `useGlobalProperties()` export which is not preset in the React one.

<table class="infotable">
<tr>
<td>
<strong>Server Module</strong>
<br>
</td>
<td class="code-h" style="width: 80%">
<code class=h>createRenderFunction()</code> —— creates and returns a render function (for SSR). Both Vue and React are based on idioms that makes this abstraction possible, but supporting more frameworks may involve expanding this API.
</td>
</tr>
</table>

<table class="infotable">
<tr>
<td>
<strong>Client Module</strong>
<br>
</td>
<td class="code-h" style="width: 80%">
<code class=h>useHydration(config)</code>
—— returns a context object with all hydrated values from the server. It'll work seamlessly for SSR (first render) and client-side navigation (History API) with a special abstraction of <a href="">route payloads</a> and <a href="">isomorphic data</a>.
<br><br><code class=h>hydrate()</code>
—— collect server rendered values (hardcoded in <code>window</code>) into an appropriate application context object (see <a href="">Client Hydration</a>).
<br><br><code class=h>isServer</code>
—— akin to <code>process.server</code> in Nuxt and <code>importa.meta.env.SSR</code> in Vite but guaranteed to work in both <b>CJS</b> and <b>ESM</b> runtimes. 
</td>
</tr>
</table>

The naming of these helper modules might be confusing. 

The <b>server</b> module is supposed to be used <b>only</b> in a server context, that is, anything exported from it should only be imported in code that's required to only run in a Node.js context. 

The <b>client</b> module is <i>everything pertaining to the client</i>, and its exports <b>should be isomorphic in nature</b>, that is, it should be impossible import the helper `client` module both in SSR (Node.js) and client (browser) contexts. Perhaps a better name for this module would be `universal`, not `client`, and this might still change in future versions of <b>fastify-vite</b>.

You can see the full pattern employed by the Vue and React fastify-vite renderers in the [base-vue]() and [base-react]() examples. You'll see for instance `createRenderFunction()` for Vue [imported here](...), and for React [imported here](...). And the client imports for Vue [here](...), and for React [here](...).


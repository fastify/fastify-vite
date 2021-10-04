# useHydration

Returns the <b>isomorphic</b> context object, aptly named _hydration context_.

<b>Works isomorphically</b> on client and server.

```js
import { useHydration } from 'fastify-vite-vue/client'
```
```js
import { useHydration } from 'fastify-vite-react/client'
```
```js
const {
  req,
  reply,
  fastify,
  $global,
  $payload,
  $payloadPath,
  $data
} = useHydration(config)
````

The `config` object passed to `useHydration` is <b>optional</b>. It can either contain a reference to `getPayload`, which will cause `$payload` and `$payloadPath` to be included in the returned object — or a reference to `getData`, which will cause `$data` to be included in the returned object.

See the _<b>Data Fetching</b>_ section on the [Vue](/guide/vue.html#data-fetching) and [React](/guide/react.html#data-fetching) guides for more info.

<table class="infotable"><tr><td>
<code class="h inline-block">req</code></td>
<td>the core Fastify <a href="https://www.fastify.io/docs/latest/Request/">request object</a> — only available on the server
</td></tr><tr><td>
<code class="h inline-block">reply</code></td>
<td>the core Fastify <a href="https://www.fastify.io/docs/latest/Reply/">reply object</a> — only available on the server
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

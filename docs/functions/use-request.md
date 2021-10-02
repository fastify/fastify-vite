# useRequest()

Returns the core Fastify [request object](https://www.fastify.io/docs/latest/Request/), only available in SSR. 

```js
import { isServer, useRequest } from 'fastify-vite-vue/server'
```
```js
import { isServer, useRequest } from 'fastify-vite-react/server'
```
```js
if (isServer) {
	const req = useRequest()
	console.log('req.url', req.url)
}
````

For convenience, here's the property reference taken from the [official Fastify documentation](https://www.fastify.io/docs/latest/):

<table class="infotable"><tr><td>
<code class="h inline-block">query</code></td>
<td>the parsed querystring
</td></tr><tr><td>
<code class="h inline-block">body</code></td>
<td>the body
</td></tr><tr><td>
<code class="h inline-block">params</code></td>
<td>the params matching the URL
</td></tr><tr><td>
<code class="h inline-block">headers</code></td>
<td>the headers
</td></tr><tr><td>
<code class="h inline-block">raw</code></td>
<td>the incoming HTTP request from Node core
</td></tr><tr><td>
<code class="h inline-block">id</code></td>
<td>the request id
</td></tr><tr><td>
<code class="h inline-block">log</code></td>
<td>the logger instance of the incoming request
</td></tr><tr><td>
<code class="h inline-block">ip</code></td>
<td>the IP address of the incoming request
</td></tr><tr><td>
<code class="h inline-block">ips</code></td>
<td><p>An array of the IP addresses in the <code>X-Forwarded-For</code> header of the incoming request.</p>
<p>Only functional if the <a href="https://www.fastify.io/docs/latest/Server#factory-trust-proxy"><code>trustProxy</code></a> server option is enabled.</p>
</td></tr><tr><td>
<code class="h inline-block">hostname</code></td>
<td>the hostname of the incoming request
</td></tr><tr><td>
<code class="h inline-block">protocol</code></td>
<td>the protocol of the incoming request (https or http)
</td></tr><tr><td>
<code class="h inline-block">method</code></td>
<td>the method of the incoming request
</td></tr><tr><td>
<code class="h inline-block">url</code></td>
<td>the url of the incoming request
</td></tr><tr><td>
<code class="h inline-block">routerMethod</code></td>
<td>the method defined for the router that is handling the request
</td></tr><tr><td>
<code class="h inline-block">routerPath</code></td>
<td>the path pattern defined for the router that is handling the request
</td></tr><tr><td>
<code class="h inline-block">is404</code></td>
<td>true if request is being handled by 404 handler, false if it is not
</td></tr><tr><td>
<code class="h inline-block">connection</code></td>
<td>Deprecated, use socket instead. The underlying connection of the incoming request.
</td></tr><tr><td>
<code class="h inline-block">socket</code></td>
<td>the underlying connection of the incoming request
</td></tr></table>

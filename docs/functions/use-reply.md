# useReply

Returns the core Fastify [reply object](https://www.fastify.io/docs/latest/Reply/), only available in SSR. 

```js
import { isServer, useReply } from 'fastify-vite-vue/server'
```
```js
import { isServer, useReply } from 'fastify-vite-react/server'
```
```js
if (isServer) {
  const reply = useReply()
}
````

For convenience, here's the API reference taken from the [official Fastify documentation](https://www.fastify.io/docs/latest/Reply/):

<table class="infotable"><tr><td>
<code class="h inline-block">code(statusCode)</code></td>
<td>sets the HTTP status code.
</td></tr><tr><td>
<code class="h inline-block">statusCode</code></td>
<td>reads and sets the HTTP status code.
</td></tr><tr><td>
<code class="h inline-block">header(name, value)</code></td>
<td>sets a response header.
</td></tr><tr><td>
<code class="h inline-block">headers(object)</code></td>
<td>sets all the keys of the object as response headers.
</td></tr><tr><td>
<code class="h inline-block">getHeader(name)</code></td>
<td>retrieve value of already set header.
</td></tr><tr><td>
<code class="h inline-block">getHeaders()</code></td>
<td>gets a shallow copy of all current response headers.
</td></tr><tr><td>
<code class="h inline-block">removeHeader(key)</code></td>
<td>remove the value of a previously set header.
</td></tr><tr><td>
<code class="h inline-block">hasHeader(name)</code></td>
<td>determine if a header has been set.
</td></tr><tr><td>
<code class="h inline-block">type(value)</code></td>
<td>sets the `Content-Type` header.
</td></tr><tr><td>
<code class="h inline-block">redirect([code,] dest)</code></td>
<td>redirect to the specified url, the status code is optional (defaults to `302`).
</td></tr><tr><td>
<code class="h inline-block">callNotFound()</code></td>
<td>Invokes the custom not found handler.
</td></tr><tr><td>
<code class="h inline-block">serialize(payload)</code></td>
<td>Serializes the specified payload using the default JSON serializer or using the custom serializer (if one is set) and returns the serialized payload.
</td></tr><tr><td>
<code class="h inline-block">serializer(function)</code></td>
<td>Sets a custom serializer for the payload.
</td></tr><tr><td>
<code class="h inline-block">send(payload)</code></td>
<td>Sends the payload to the user, could be a plain text, a buffer, JSON, stream, or an Error object.
</td></tr><tr><td>
<code class="h inline-block">sent</code></td>
<td>A boolean value that you can use if you need to know if send has already been called.
</td></tr><tr><td>
<code class="h inline-block">raw</code></td>
<td>The [http.ServerResponse](https://nodejs.org/dist/latest-v14.x/docs/api/http.html#http_class_http_serverresponse) from Node core.
</td></tr><tr><td>
<code class="h inline-block">log</code></td>
<td>The logger instance of the incoming request.
</td></tr><tr><td>
<code class="h inline-block">request</code></td>
<td>The incoming request.
</td></tr><tr><td>
<code class="h inline-block">context</code></td>
<td>access to the request's [context property](https://www.fastify.io/docs/latest/Request#Request).
</td></tr></table>

# Functions

## useFastify

Returns reference to the Fastify server instance, only available in SSR.

```js
import { useFastify } from 'fastify-vite-vue/server'

const fastify = useFastify()
````

This reference is also included in [`useHydration`](/functions/use-hydration)'s return object as `fastify`.

## useHydration

Returns the <b>isomorphic</b> context object, aptly named _hydration context_.

<b>Works isomorphically</b> on client and server.

## Vue

```js
import { useHydration } from 'fastify-vite-vue/client'

const ctx = useHydration(config)
````

## React

```js
import { useHydration } from 'fastify-vite-react/client'

const [ctx, update] = useHydration(config)
````

In React an `update` function is also returned because `ctx` is not reactive like in the Vue version.

## Config

The `config` object passed to `useHydration` is <b>optional</b>. It can either contain a reference to `getPayload`, which will cause `$payload` and `$payloadPath` to be included in the returned object — or a reference to `getData`, which will cause `$data` to be included in the returned object.

See the _<b>Data Fetching</b>_ section on the [Vue](/guide/vue.html#data-fetching) and [React](/guide/react.html#data-fetching) guides for more info.

## Context

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

# useReply

Returns the core Fastify [reply object](https://www.fastify.io/docs/latest/Reply/), only available in SSR. 

```js
import { useReply } from 'fastify-vite-vue/server'
```
```js
import { useReply } from 'fastify-vite-react/server'
```
```js
const reply = useReply()
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

This reference is also included in `useHydration`'s return object as `reply`.

# useRequest

Returns the core Fastify [request object](https://www.fastify.io/docs/latest/Request/), only available in SSR. 

```js
import { useRequest } from 'fastify-vite-vue/server'
```
```js
import { useRequest } from 'fastify-vite-react/server'
```
```js
const req = useRequest()
````

For convenience, here's the API reference taken from the [official Fastify documentation](https://www.fastify.io/docs/latest/Request/):

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
<code class="h inline-block">socket</code></td>
<td>the underlying connection of the incoming request
</td></tr></table>

This reference is also included in `useHydration`'s return object as `req`.

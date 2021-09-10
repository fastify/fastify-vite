# Route Hooks

<b>fastify-vite</b> lets you define Fastify [route-level hooks](https://www.fastify.io/docs/latest/Hooks/#requestreply-hooks) directly in your <b>view files</b>, as long as you use the `loadRoutes()` method provided by your chosen renderer adapter. 

Below is a quick rundown of all Fastify route-level hooks available:

<table class="infotable">
<tr style="width: 100%">
<td style="width: 20%">
<strong>Fastify Hooks</strong>
<br><br><b>Route Level</b>
</td>
<td class="code-h" style="width: 80%">
<code class="h inline-block">onRequest</code>
—— Executed as soon as a new request comes in
<br><br>
<code class="h inline-block">preParsing</code>
—— Receives stream with the current request raw body payload
<br><br>
<code class="h inline-block">preValidation</code>
—— Allows changing req.body prior to validation
<br><br>
<code class="h inline-block">preHandler</code>
—— Executed before the associated route handler
<br><br>
<code class="h inline-block">preSerialization</code>
—— Allows changing response body prior to serialization
<br><br>
<code class="h inline-block">onError</code>
—— Executed when there's an error 
<br><br>
<code class="h inline-block">onSend</code>
—— Allows changing the serialized response body
<br><br>
<code class="h inline-block">onResponse</code>
—— Executed after the response has been sent
<br><br>
<code class="h inline-block">onTimeout</code>
—— Executed when there's a timeout (if you set <code>connectionTimeout</code>)
</td>
</tr>
</table>

<br>

The following examples for Vue and React demonstrate how to leverage automatic [client hydration](/advanced/client-hydration) for `req.$data` —— that is made available on the client as `ctx.$data` via `useHydration()` —— from Fastify's `onResponse` route hook. To make it absolutely crystal clear:

<table class="infotable">
<tr style="width: 100%">
<td style="width: 20%">
<strong>Execution Order</strong>
<br><br><b>onResponse data client hydration example</b>
</td>
<td class="code-h" style="width: 80%">
<span class="h inline-block"><b>1.</b> <code>onResponse</code> hook runs on the server, <code>req.$data</code> gets populated</span>
<br><br>
<span class="h inline-block"><b>2.</b> <b>fastify-vite</b>'s <code>getHydrationScript()</code> is called from handler</span>
<br><br>
<span class="h inline-block"><b>3.</b> Hydration takes place on client entry point with <code>hydrate()</code></span>
<br><br>
<span class="h inline-block"><b>4.</b> Hydrated data available via <code>useHydration()</code> on Vue or React view</span>
</td>
</tr>
</table>

::: tip
Bear in mind `ctx.$data` would no longer be populated following client-side navigation (History API) in these examples. For this you need to ensure data can be retrieved from the client as well.

This is covered in [Isomorphic Data]().
:::

## Vue

```vue
<template>
  <h2>Registering Fastify route hooks via exports</h2>
  <p>{{ ctx.$data ? ctx.$data.msg : 'Refresh (SSR) to get server data' }}</p>
</template>

<script>
import { useHydration, isServer } from 'fastify-vite-vue/client'

export const path = '/route-hooks'

export async function onRequest (req) {
  req.$data = { msg: 'hello from onRequest' }
}

export default {
  async setup () {
    const ctx = await useHydration()
    return { ctx }
  }
}
</script>

```

## React

```jsx
import { useHydration } from 'fastify-vite-react/client'

export const path = '/route-hooks'

export async function onRequest (req) {
  req.$data = { msg: 'hello from onRequest' }
}

export default function RouteHooks () {
  const [ctx] = useHydration()

  return (
    <>
      <h2>Registering Fastify route hooks via exports</h2>
      <p>{ ctx.$data ? ctx.$data.msg : 'Refresh (SSR) to get server data' }</p>
    </>
  )
}
```

## Manual

Alternatively, you can manually pass them to your Fastify route definitions:

```js
fastify.vite.get('/*', {
  onRequest (req, reply, done) {
    done()
  }
})
```

Or via the `routes` array exported in the server entry point.

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

Or also manually in the `routes` array exported in the server entry point.

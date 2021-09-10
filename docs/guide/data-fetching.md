---
sidebarDepth: 3
---

# Data Fetching

<b>fastify-vite</b> prepacks two different _convenience mechanisms_ for fetching data before and after initial page load. Those are in essence just two different <b>data functions</b> you can export from your view files.

One is for when your data function can only run on the server, the other is for when your data function needs to be isomorphic, that is, run both on server and client the very same way.

## Route Payloads

The first is `getPayload()`, which is in a way very similar to `getServerSideProps` [in Next.js](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering), but has some other tricks of its own too. Below is a detailed overview of how it works:

<table class="infotable">
<tr style="width: 100%">
<td style="width: 20%">
<strong>getPayload()</strong>
</td>
<td class="code-h" style="width: 80%">
<br>
<span class="h inline-block">Will only run on the server, <b>before any application SSR takes place</b>, because it's set up to run automatically in the route's <code>preHandler</code> hook.</span>
<br><br>
<span class="h inline-block">Providing this function will also cause a GET JSON endpoint to be set up to run it remotely. The endpoint URL is generated following the <code>/-/payload/:url</code> format.</span>
<br><br>When <code>getPayload()</code> is provided:
<br><br><b>•</b> During first-render, on the server, it is executed via a <code>preHandler</code> hook.
<br><br><b>•</b> Its result is stored as <code>req.$payload</code> and then serialized for client hydration. 
<br><br><b>•</b> On the client, the hydrated value is available via <code>useHydration()</code> as <code>$payload</code>
<br><br><b>•</b> For client-side navigation, <code>useHydration()</code> will call the JSON endpoint automatically
<br><br><b>•</b> It also provides <code>$payloadPath()</code>, to get the JSON endpoint programatically
<br><br>
</td>
</tr>
</table>

### getPayload() example

Below is a `getPayload()` example that will return an object with a `message` property containing either the value of the `message` query string URL parameter, or a default string. 

```js
export const path = '/route-payload'

export async function getPayload ({ req }) {
  // Simulate a long running request
  await new Promise((resolve) => setTimeout(resolve, 3000))

  return {
    message: req?.query?.message || 'Hello from server',
  }
}
```

#### getPayload() + useHydration() Vue example

```vue
<template>
  <h2>Automatic route payload endpoint</h2>
  <template v-if="ctx.$loading">
    <p>Loading...</p>
  </template>
  <template v-else>
    <p>Message: {{message || ctx.$payload?.message}}</p>
    <button @click="refreshPayload">
      Click to refresh payload from server
    </button>
  </template>
</template>

<script>
export const path = '/route-payload'

export async function getPayload ({ req }) {
  // ...
  // Omitted for brevity
  // ...
}

export default {
  setup () {
  	// Pass getPayload reference to useHydration() so 
  	// it knows that's what is being used for this component
    const ctx = useHydration({ getPayload })
    const message = ref(null)

    // Example of manually using ctx.$payloadPath()
    // to construct a new request to this page's automatic payload API
    async function refreshPayload () {
      ctx.$loading = true
      const response = await window.fetch(`${
        ctx.$payloadPath()
      }?message=${
        encodeURIComponent('Hello from client')
      }`)
      const json = await response.json()
      message.value = json.message
      ctx.$loading = false
    }
    return { ctx, message, refreshPayload }
  }
}
</script>
```

#### getPayload() + useHydration() React example

```jsx
export default function RoutePayload () {
  const [ctx, update] = useHydration({ getPayload })
  const [message, setMessage] = useState(null)

  // Example of manually using ctx.$payloadPath()
  // to construct a new request to this page's automatic payload API
  async function refreshPayload () {
    update({ $loading: true })
    const response = await window.fetch(`${
      ctx.$payloadPath()
    }?message=${
      encodeURIComponent('Hello from client')
    }`)
    const json = await response.json()
    setMessage(json.message)
    update({ $loading: false })
  }
  if (ctx.$loading) {
    return (
      <>
        <h2>Automatic route payload endpoint</h2>
        <p>Loading...</p>
      </>
    )
  }
  return (
    <>
      <h2>Automatic route payload endpoint</h2>
      <p>Message: {message || ctx.$payload?.message}</p>
      <button onClick={refreshPayload}>
        Click to refresh payload from server
      </button>
    </>
  )
}
```

## Isomorphic Data

The second convenience mechanism is `getData()`. This resembles the classic [`asyncData()`][async-data] in Nuxt.js, with a twist: on the server <b>fastify-vite</b> will run `getData()` in a `preHandler` hook, before any SSR takes place. It works essentially as a <b>prepass</b> data handler (like [react-ssr-prepass][prepass]).

[async-data]: https://nuxtjs.org/examples/data-fetching-async-data
[prepass]: https://github.com/FormidableLabs/react-ssr-prepass

<table class="infotable">
<tr style="width: 100%">
<td style="width: 20%">
<strong>getData()</strong>
</td>
<td class="code-h" style="width: 80%">
<br>
<span class="h inline-block">Will run both on the server, <b>before any application SSR takes place</b>, in the route's <code>preHandler</code> hook, —— <b>and</b> on the client —— following History API navigation.</span>
<br><br>When <code>getData()</code> is provided:
<br><br><b>•</b> During first-render, on the server, it is executed via a <code>preHandler</code> hook.
<br><br><b>•</b> Its result is stored as <code>req.$data</code> and then serialized for client hydration. 
<br><br><b>•</b> On the client, the hydrated value is available via <code>useHydration()</code> as <code>$data</code>
<br><br><b>•</b> For client-side navigation, <code>useHydration()</code> <b>executes <code>getData()</code> isomorphically</b>
<br><br>
</td>
</tr>
</table>

### getData() + useHydration() Vue example

```vue
<template>
  <h2>Isomorphic data fetching</h2>
  <p v-if="ctx.$loading">Loading...</p>
  <p v-else>{{ JSON.stringify(ctx.$data) }}</p>
</template>

<script>
import { useHydration, isServer } from 'fastify-vite-vue/client'
import ky from 'ky-universal'

export const path = '/data-fetching'

export async function getData ({ req, $api }) {
  return {
    message: isServer
      ? req.query?.message ?? 'Hello from server'
      : 'Hello from client',
    result: await ky('https://httpbin.org/json').json(),
  }
}

export default {
  async setup () {
    const ctx = await useHydration({ getData })
    return { ctx }
  }
}
</script>
```


### getData() + useHydration() React example

```jsx
import { useHydration, isServer } from 'fastify-vite-react/client'
import ky from 'ky-universal'

export const path = '/data-fetching'

export async function getData ({ req }) {
  return {
    message: isServer
      ? req.query?.message ?? 'Hello from server'
      : 'Hello from client',
    result: await ky('https://httpbin.org/json').json(),
  }
}

export default function DataFetching (props) {
  const [ctx] = useHydration({ getData })
  if (ctx.$loading) {
    return (
      <>
        <h2>Isomorphic data fetching</h2>
        <p>Loading...</p>
      </>
    )
  }
  return (
    <>
      <h2>Isomorphic data fetching</h2>
      <p>{JSON.stringify(ctx.$data)}</p>
    </>
  )
}
```
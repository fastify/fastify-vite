---
sidebarDepth: 3
---

# Data Fetching

<b>fastify-vite</b> prepacks two different **_convenience mechanisms_** for fetching data before and after initial page load. Those are in essence just two different <b>data functions</b> you can export from your view files.

One is for when your data function can only run on the server but still needs to be accessible from the client via an HTTP API call, the other is for when your data function needs to be fully isomorphic, that is, run both on server and client exactly the same way.

## Route Payloads

The first is `getPayload`, which is in a way very similar to `getServerSideProps` [in Next.js](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering), but has some other tricks of its own. Exporting a `getPayload` function from a view will **automatically cause it to be called prior to SSR when rendering the route it's associated to**, but will **also automatically register an endpoint where you can call it from the client**. Not only that, coupled with <b>fastify-vite</b>'s [`useHydration`](/functions/use-hydration) isomorphic hook, `getPayload` will stay working seamlessly during client-side navigation ([History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) via [Vue Router](https://next.router.vuejs.org/), [React Router](https://reactrouter.com/) etc). In that regard it's very similar to `asyncData` Nuxt.js, which will also work seamlessly during SSR and client-side navigation.

In a nutshell — navigating to a route on the client will cause an HTTP request to be triggered automatically for that route's payload data. If the route is being server-side rendered, data is retrieved on the server and just hydrated on the client on first render.

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

On the server, `getPayload` is set up to run automatically in the route's [`preHandler`](https://www.fastify.io/docs/latest/Hooks/#prehandler) hook.

Providing this function will also cause a GET JSON endpoint to be set up to run it remotely. The endpoint URL is generated following the <code>/-/payload/:url</code> format. 

If you're exporting a `getPayload` function from the `/foobar` view component, then the automatically registered endpoint will be `/-/payload/foobar`.

So, to recap — because this can be a little confusing at first — <b>here's the rundown</b>:

- During first-render, on the server, `getPayload` is executed via a [`preHandler`](https://www.fastify.io/docs/latest/Hooks/#prehandler) hook.
- Its result is stored as <code>req.$payload</code> and then serialized for [client hydration](/internals/client-hydration). 
- <b>Both on the server and on the client, the value is available via `useHydration` as `$payload`</b>.
- <b>For client-side navigation, <code>useHydration</code> will call the HTTP endpoint automatically</b>.


### Retrieving payload with useHydration

The `useHydration` hook takes a configuration object as first parameter. The purpose of this configuration object is to easily to hold a reference to the data function being used in the view.

```vue{4-8,12-14}
<script>
export const path = '/route-payload'

export async function getPayload ({ req, reply, fastify }) {
  // ...
  // Omitted for brevity
  // ...
}

export default {
  setup () {
  	// Pass getPayload reference to useHydration() so 
  	// it knows that's what is being used for this component
    const { $payload } = useHydration({ getPayload })
    return { message: $payload.message }
  }
}
</script>
```

`useHydration` doesn't really do anything with the `getPayload`, **it just uses it to know what to do**.

If it sees a reference to a function named `getPayload`, it will know `getPayload` is defined in that scope and it should try to retrieve a route payload — either live during SSR, hydrated on the client or retrieved via the automatically created HTTP endpoint.

::: tip
As a convention, special properties associated with data fetching functions have the `$` prefix.
:::

`useHydration` also provides the `$payloadPath` function, to get the HTTP endpoint programatically. In the snippet below, a new request to the page's payload endpoint set up to be performed manually. It also shows the <b>reactive</b> context object returned by `useHydration` used to manage loading status.

```js
export default {
  setup () {
    const ctx = useHydration({ getPayload })
    const message = ref(null)

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
## Data Fetching

<b>fastify-vite</b> prepacks two different **_convenience mechanisms_** for fetching data before and after initial page load. Those are in essence just two different <b>data functions</b> you can export from your view files.

One is for when your data function can only run on the server but still needs to be accessible from the client via an HTTP API call, the other is for when your data function needs to be fully isomorphic, that is, run both on server and client exactly the same way.

### Route Payloads

[async-data]: https://nuxtjs.org/examples/data-fetching-async-data
[prepass]: https://github.com/FormidableLabs/react-ssr-prepass
[preHandler]: https://www.fastify.io/docs/latest/Hooks/#prehandler

The first is `getPayload`, which is in a way very similar to `getServerSideProps` [in Next.js](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering), with a dash of [react-ssr-prepass][prepass]. Exporting a `getPayload` function from a view will **automatically cause it to be called <b>prior to SSR</b> (still in the Fastify layer) when rendering the route it's associated to**, but will **also automatically register an endpoint where you can call it from the client**. Not only that, coupled with <b>fastify-vite</b>'s `useHydration` isomorphic hook, `getPayload` will stay working seamlessly during client-side navigation ([History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) via [Vue Router](https://next.router.vuejs.org/), [React Router](https://reactrouter.com/) etc). In that regard it's very similar to `asyncData` Nuxt.js, which will also work seamlessly during SSR and client-side navigation.

In a nutshell — navigating to a route on the client will cause an HTTP request to be triggered automatically for that route's payload data. If the route is being server-side rendered, data is retrieved on the server and just hydrated on the client on first render.

```js
export const path = '/route-payload'

// Will absolutely only run on the server, so it's safe to
// assume req, reply and fastify references are defined 
// in the context object passed as first parameter
export async function getPayload ({ req, reply, fastify }) {
  // Simulate a long running request
  await new Promise((resolve) => setTimeout(resolve, 3000))

  return {
    message: req.query?.message || 'Hello from server',
  }
}
```

On the server, `getPayload` is set up to run automatically in the route's [`preHandler`][preHandler] hook.

Providing this function will also cause a GET JSON endpoint to be set up to run it remotely. The endpoint URL is generated following the <code>/-/payload/:url</code> format. 

If you're exporting a `getPayload` function from the `/foobar` view component, then the automatically registered endpoint will be `/-/payload/foobar`.

So, to recap — because this can be a little confusing at first — <b>here's the rundown</b>:

- During first-render, on the server, `getPayload` is executed via a [`preHandler`][preHandler] hook.
- Its result is stored as <code>req.$payload</code> and then serialized for [client hydration](/concepts/client-hydration). 
- <b>Both on the server and on the client, the value is available via `useHydration` as `$payload`</b>.
- <b>For client-side navigation, <code>useHydration</code> will call the HTTP endpoint automatically</b>.


#### Retrieving payload with useHydration

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

`useHydration` also provides the `$payloadPath` function, to get the HTTP endpoint programatically. In the snippet below, a new request to the page's payload endpoint set up to be performed manually.

It also shows the <b>reactive</b> context object returned by `useHydration` used to manage loading status, in the case where it's triggering a request to the payload HTTP endpoint client-side.

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

Learn more by playing with the [`vue-data`](https://github.com/terixjs/flavors/tree/main/vue-data) boilerplate flavor:

`degit terixjs/flavors/vue-data your-app`

### Isomorphic Data

The second convenience mechanism is `getData`. It's very similar to `getPayload` as <b>fastify-vite</b> will also run it from the route's [preHandler][preHandler] hook. 

But it resembles the classic [`asyncData`][async-data] from Nuxt.js more closely — because the very same `getData` function gets executed both on the server and on the client (during navigation). If it's executed first on the server, the client gets the [hydrated](/concepts/client-hydration) value on first render. 

::: tip
When using `getPayload`, the client is able to execute that very same function, but via a HTTP request to an automatically created endpoint that provides access to it on the server.
:::

Below is a minimal example — like in the previous `getPayload` examples, you must pass a reference to the `getData` function used to `useHydration`.

```vue
<script>
import { fetch } from 'fetch-undici'
import { useHydration, isServer } from 'fastify-vite-vue/client'

export const path = '/data-fetching'

export async function getData ({ req }) {
  const response = await fetch('https://httpbin.org/json')
  return {
    message: isServer
      ? req.query?.message ?? 'Hello from server'
      : 'Hello from client',
    result: await response.json(),
  }
}

export default {
  async setup () {
    const { $data } = await useHydration({ getData })
    return { message: $data.message }
  }
}
</script>
```

Notice how this example uses [fetch-undici](https://www.npmjs.com/package/fetch-undici) to provide isomorphic access to [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

To recap:

- During first-render, on the server, `getData` is executed via a [`preHandler`][preHandler] hook.
- Its result is stored as <code>req.$data</code> and then serialized for [client hydration](/concepts/client-hydration). 
- <b>Both on the server and on the client, the value is available via `useHydration` as `$data`</b>.
- <b>For client-side navigation, <code>useHydration</code> executes the `getData` function isomorphically</b>.

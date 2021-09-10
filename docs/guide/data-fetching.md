# Data Fetching

## Route Payloads

<b>fastify-vite</b> includes a simple mechanism for associating data payloads to your pages and accessing them in an isomorphic way. All you need is to export a `getPayload()` function from your view file:

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

Providing this function will also automatically cause an extra endpoint based on the original route path to be registered, for on-demand fetches from the client.

<b>For example</b>, if the `/hello` view exports a `getPayload()` function, a `/-/payload/hello` route will be also automatically registered.

## Isomorphic Data



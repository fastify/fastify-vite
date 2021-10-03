# useFastify

Returns reference to the Fastify server instance, only available in SSR.

```js
import { useFastify } from 'fastify-vite-vue/server'
```
```js
import { useFastify } from 'fastify-vite-react/server'
```
```js
const fastify = useFastify()
````

This reference is also included in [`useHydration`](/functions/use-hydration)'s return object as `fastify`.

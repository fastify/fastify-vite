# Island Mode

<b>fastify-vite</b> offers **experimental** support for the [partial hydration](https://docs.astro.build/core-concepts/component-hydration/) and [islands architecture](https://jasonformat.com/islands-architecture/). This is inspired by the [Astro framework](https://astro.build/), with some much valuable cues taken from Máximo Mussini's [iles](https://github.com/ElMassimo/iles).

Although <b>module federation</b> is still missing, using the new `packIsland` function from the <b style="white-space: nowrap;">fastify-vite/app</b> module it's already possible to pack any route's response as an individual island without any external JavaScript requests, just the absolute minimum to control its **lazy loading**.

```js
import { packIsland, onIdle } from 'fastify-vite/app'

export const path = '/'
export const onSend = packIsland('#app', onIdle)
```

You can use the built-in `onIdle`, `onMedia` and `onDisplay` loaders or provide your own:


```js
import { packIsland } from 'fastify-vite/app'

function loadJavaScriptOnlyAfter10Seconds (callback) {
  setTimeout(callback, 10*1000)
}

export const path = '/'
export const onSend = packIsland('#app', loadJavaScriptOnlyAfter10Seconds)
```

See full example [here](https://github.com/terixjs/fastify-vite/tree/main/examples/vue-island).

This functionality is **framework-agnostic** and also works with [<b>generate</b>](http://localhost:4000/guide/deployment.html#static-generation) and [<b>generate-server</b>](http://localhost:4000/guide/deployment.html#generate-server).

::: tip 
The compiler backing `packIsland` is just a **proof-of-concept**. The final implementation will use `ctx.modules` from Vite directly rather than trying to parse out all the generated markup.
:::

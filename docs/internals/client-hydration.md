
# Client Hydration

If data is retrieved on the server during SSR and is used to generate any fragment of the rendered markup, the same data needs to be made available on the client prior to initialization. Or the same data needs to be retrieved, on the client, prior to initialization. Of course this is non-ideal, if an API call already took place on the server, there's no reason to repeat it client-side for _first-render_.

A common technique for solving this problem is to append a `<script>` snippet to the rendered markup containing serialized data, so it can be picked up (<b>[_hydrated_](https://en.wikipedia.org/wiki/Hydration_(web_development)
)</b>) during app initialization. Nuxt.js and Next.js use [`__NUXT__`][window-nuxt] and [`__NEXT_DATA__`][next-data] for this, respectively.

[window-nuxt]: https://github.com/nuxt/nuxt.js/blob/82e4c2dc5fa62be60876da7bb0ec271a921954bc/packages/vue-renderer/src/renderers/ssr.js
[next-data]: https://github.com/vercel/next.js/discussions/15117

<b>fastify-vite</b> uses a similar approach, while allowing for a deep level of customization. For instance, below is the code used to generate the serialized hydration data for <b>fastify-vite-vue</b> and <b>fastify-vite-react</b> renderer adapters. The function used in both is identical, and can be overriden if you set the `render.getHydrationScript` option with a function of your own.

<table class="infotable">
<tr style="width: 100%">
<td style="width: 20%">
<strong>getHydrationScript()</strong>
<br><br>
<span style="font-size: 0.7rem">

Generates `<script>` tag 
with serialized data
obtained during SSR

</span>
</td>
<td class="code-h" style="width: 80%">

```js

function getHydrationScript (req, context, hydration) {
  const globalData = req.$global
  const data = req.$data
  const payload = req.$payload
  const api = req.api ? req.api.meta : null

  let hydrationScript = ''

  if (globalData || data || payload || api) {
    hydrationScript += '<script>'
    if (globalData) {
      hydrationScript += `window[Symbol.for('kGlobal')] = ${devalue(globalData)}\n`
    }
    if (data) {
      hydrationScript += `window[Symbol.for('kData')] = ${devalue(data)}\n`
    }
    if (payload) {
      hydrationScript += `window[Symbol.for('kPayload')] = ${devalue(payload)}\n`
    }
    if (api) {
      hydrationScript += `window[Symbol.for('kAPI')] = ${devalue(api)}\n`
    }
    hydrationScript += '</script>'
  }

  return hydrationScript
}
```

</td>
</tr>
</table>

The first parameter it receives is Fastify's Request object, followed by the SSR rendering `context` and the `hydration` key from the plugin options. Typically you won't want to change these.

::: tip
I found out later SolidJS has a [similar abstraction][solid-js-hydration] for this. Sadly, we do not have a <b>renderer adapter</b> for SolidJS yet but it certainly looks very feasible. [Pull Requests]() welcome.

[solid-js-hydration]: https://www.solidjs.com/guide#hydration-script
:::

On the client, you can use the `hydrate()` function provided by <b>fastify-vite-vue</b>:

<table class="infotable">
<tr style="width: 100%">
<td style="width: 20%">
<strong>hydrate()</strong>
<br><br>
<span style="font-size: 0.7rem">
<b>Vue</b> version
</span>
</td>
<td class="code-h" style="width: 80%">

```js

function hydrate (app) {
  const hydration = {
    $global: window[kGlobal],
    $data: window[kData],
    $payload: window[kPayload],
    $payloadPath: () => `/-/payload${document.location.pathname}`,
    $api: new Proxy({ ...window[kAPI] }, {
      get: manifetch({
        prefix: '',
        fetch: (...args) => fetch(...args),
      }),
    }),
  }
  assign(app.config.globalProperties, hydration)
  delete window[kGlobal]
  delete window[kData]
  delete window[kPayload]
  delete window[kAPI]
}
```

</td>
</tr>
</table>

Or <b>fastify-vite-react</b>:

<table class="infotable">
<tr style="width: 100%">
<td style="width: 20%">
<strong>hydrate()</strong>
<br><br>
<span style="font-size: 0.7rem">
<b>React</b> version
</span>
</td>
<td class="code-h" style="width: 80%">

```js

function hydrate (app) {
  const context = {
    $global: window[kGlobal],
    $payloadPath: () => `/-/payload${document.location.pathname}`,
    $payload: window[kPayload],
    $data: window[kData],
    $api: new Proxy({ ...window[kAPI] }, {
      get: manifetch({
        prefix: '',
        fetch: (...args) => fetch(...args),
      }),
    }),
  }
  delete window[kGlobal]
  delete window[kData]
  delete window[kPayload]
  delete window[kAPI]
  return context
}
```

</td>
</tr>
</table>

Both are practically the same, and like `getHydrationScript()`, can also very easily be replaced with your own if you need to. In that case you'd provide it directly in your application's <b>client entry point</b> instead of importing from <b>fastify-vite-vue/client</b> or <b>fastify-vite-react/client</b>.
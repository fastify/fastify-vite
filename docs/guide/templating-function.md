<!--@include: ./parts/links.md-->
<!--@include: ./parts/notice.md-->

# Templating Function

As per Vite's documentation, `index.html` is a special file made part of the module resolution graph. It's how Vite finds all the code that is supposed to run.

When you run the `vite build` command, `index.html` is what Vite automatically looks for. Given this special nature, you probably want to keep it as simple as possible, using HTML comments to specify content placeholders. That's the pattern used across the official SSR examples from [Vite's playground](https://github.com/vitejs/vite/tree/main/packages/playground).

**`@fastify/vite`** will automatically add ([decorate](https://fastify.dev/docs/latest/Reference/Decorators/)) a `html()` method on the **Fastify** `Reply` class. This method sends your Vite project's `index.html` to the client with the appropriate media type (`text/html`). But it can also replace variable placeholders in your `index.html`. That's because **`@fastify/vite`** packs a helper function that **turns an HTML document with placeholders indicated by HTML comments into a precompiled templating function**:

```js
import { createHtmlTemplateFunction } from '@fastify/vite/utils'

const template = createHtmlTemplateFunction(
  '<main><!-- foobar --></main>'
)
console.log(
  template({ foobar: 'This will be inserted' })
)
```

The snippet above prints out `<main>This will be inserted</main>`.

By default, that function is used internally by the `createHtmlFunction()` configuration option, which is responsible for returning the function that is registered as `reply.html()`. In the snippet below you can see how `createHtmlFunction()` is defined by default in `@fastify/vite`.

Notice that `createHtmlTemplateFunction()` is not only a utility you can import from `@fastify/vite/utils`, but is also set as configuration hook within `@fastify/vite`. If you want to use a different templating engine, just provide a different `createHtmlTemplateFunction()` implementation and it will be automatically used by the [**default definition of `createHtmlFunction()`**](https://github.com/fastify/fastify-vite/blob/dev/packages/fastify-vite/config.js#L58):

```js
function createHtmlFunction (source, scope, config) {
  const indexHtmlTemplate = config.createHtmlTemplateFunction(source)
  if (config.spa) {
    return function () {
      this.type('text/html')
      this.send(indexHtmlTemplate({ element: '' }))
      return this
    }
  }
  return async function (ctx) {
    this.type('text/html')
    this.send(indexHtmlTemplate(ctx ?? await this.render()))
    return this
  }
}
```

Notice that if no parameter is passed to `reply.html()`, it will automatically run `reply.render()` and use its result implicitly.

In many cases, it's very likely you'll want to provide your own `createHtmlFunction()` hook through **`@fastify/vite`**'s plugin options. For instance, the [`vue-streaming`](https://github.com/fastify/fastify-vite/tree/dev/examples/vue-streaming) example demonstrates a custom implementation that works with a stream instead of a raw string. And of course the core renders [`@fastify/vue`][fastify-vue] and [`@fastify/react`][fastify-react] have their own implementations as well.

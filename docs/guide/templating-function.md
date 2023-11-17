# Templating Function

**`@fastify/vite`** automatically [decorates](https://www.fastify.io/docs/latest/Reference/Decorators/) the Fastify [Reply](https://www.fastify.io/docs/latest/Reference/Reply/) class with two additional methods, `reply.render()` and `reply.html()`. 

This section explores how to define `reply.html()` — to learn about `reply.render()` check out [Rendering Function](/guide/rendering-function).

Let's shift attention to [`client/index.html`]() from the [`react-vanilla`](https://github.com/fastify/fastify-vite/tree/dev/examples/react-vanilla) example:

```html
<!DOCTYPE html>
<main><!-- element --></main>
<script type="module" src="/mount.js"></script>
```

As per Vite's documentation, `index.html` is a special file made part of the module resolution graph. It's how Vite finds all the code that runs client-side. 

When you run the `vite build` command, `index.html` is what Vite automatically looks for. Given this special nature, you probably want to keep it as simple as possible, using HTML comments to specify content placeholders. That's the pattern used across the official SSR examples from [Vite's playground](https://github.com/vitejs/vite/tree/main/packages/playground).

Before we dive into `reply.html()`, you should know **`@fastify/vite`** packs a helper function that turns an HTML document with placeholders indicated by comments into a precompiled templating function:

```js
import { createHtmlTemplateFunction } from '@fastify/vite/utils'

const template = createHtmlTemplateFunction('<main><!-- foobar --></main>')
const html = template({ foobar: 'This will be inserted '})
```

By default, that function is used internally by the `createHtmlFunction()` configuration option, which is responsible for returning the function that is decorated as `reply.html()`. 

Here's how `createHtmlFunction()` is defined by default:

```js
function createHtmlFunction (source, scope, config) {
  const indexHtmlTemplate = config.createHtmlTemplateFunction(source)
  return function (ctx) {
    this.type('text/html')
    this.send(indexHtmlTemplate(ctx))
  }
}
```

You can see that default definition (and many others) in **`@fastify/vite`**'s [internal `config.js`](https://github.com/fastify/fastify-vite/blob/dev/packages/fastify-vite/config.js#L51) file. 

Looking at the default `createHtmlFunction()` above, you can probably guess how the [`react-vanilla`](https://github.com/fastify/fastify-vite/tree/dev/examples/react-vanilla) example works now. The result of `render()` is a simple object with variables to be passed to `reply.html()`, which uses the precompiled templating function based on `index.html`.

In some cases, it's very likely you'll want to provide your own `createHtmlFunction()` option through **`@fastify/vite`**'s plugin options. For instance, the [`vue-streaming`](https://github.com/fastify/fastify-vite/tree/dev/examples/react-vanilla) example demonstrates a custom implementation that works with a stream instead of a raw string.

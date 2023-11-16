
## Project Structure

The [starter template](https://github.com/fastify/fastify-dx/tree/dev/starters/vue) looks like this:

```
├── server.js
├── client/
│    ├── index.js
│    ├── context.js
│    ├── root.vue
│    ├── index.html
│    ├── layouts/
│    │    ├── default.vue
│    │    └── auth.vue
│    └── pages/
│          ├── index.vue
│          ├── client-only.vue
│          ├── server-only.vue
│          ├── streaming.vue
│          ├── using-data.vue
│          └── using-store.vue
├── vite.config.js
└── package.json
```
  
Several internal files are provided as virtual modules by Fastify DX. They are located inside the `@fastify/vue` package in `node_modules`, and dynamically loaded so you don't have to worry about them unless you want them overriden. 

In this case, placing a file with the same name as the registered virtual module in your Vite project root will override it. Find the detailed rundown of all virtual modules [here][virtual-modules].

[virtual-modules]: https://github.com/fastify/fastify-dx/blob/main/docs/vue/virtual-modules.md

The `server.js` file is your application entry point. It's the file that runs everything. It boots a Fastify server configured with [**fastify-vite**](https://github.com/fastify/fastify-vite) and **Fastify DX for Vue** as a renderer adapter to **fastify-vite**. 

The `client/index.js` file is your Vite server entry point, it's the file that provides your client bundle (which runs in the Vite-enriched environment) to the Node.js environment where Fastify runs. 

> Right now, it's mostly a **boilerplate file** because it must exist but it will also probably never need to be changed.

It exports your application's factory function (must be named `create`), the application routes (must be named `routes`) and the universal route context [initialization module](https://github.com/fastify/fastify-dx/blob/main/docs/vue/route-context.md#initialization-module) (must be named `context` and have a dynamic module import so Fastify DX can pick up `default` and named exports).

The `client/index.html` file is the [root HTML template of the application](https://vitejs.dev/guide/#index-html-and-project-root), which Vite uses as the client bundling entry point. 

> You can expand this file with additional `<meta>` and `<link>` tags if you wish, provided you don't remove any of the placeholders. 

This files links to `/dx:mount.js`, which is a virtual module provided by Fastify DX. 

Virtual modules are covered [here][virtual-modules].
  
The `client/pages/` directory contains your route modules, whose paths are dynamically inferred from the directory structure itself. You can change this behavior easily. More on this [here][routing-config].

[routing-config]: https://github.com/fastify/fastify-dx/blob/main/docs/vue/routing-config.md

The `client/layouts/` directory contains your route layout modules, which can be associated to any route. By default, `layouts/default.vue` is used, but if you don't need to do any modifications on that file, you can safely removed as it's provided by Fastify DX in that case. The starter template also comes with `layouts/auth.vue`, to demonstrate a more advanced use of layouts.

[routing-config]: https://github.com/fastify/fastify-dx/blob/main/docs/vue/routing-config.md

The `client/context.js` file is the universal [route context][route-context] initialization module. Any named exports from this file are attached to the `RouteContext` class prototype on the server, preventing them from being reassigned on every request. The `default` export from this file, however, runs for every request so you can attach any request-specific data to it.

[route-context]: https://github.com/fastify/fastify-dx/blob/main/docs/vue/route-context.md


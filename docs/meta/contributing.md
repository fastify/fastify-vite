---
sidebarDepth: 2
---

# Contributing

Despite having received a handful of code contributions already, <b>fastify-vite</b> is still very much an individual endeavor. It very much welcomes contributors interested in helping with:

- [The test suite](), which is currently broken (outdated)
- [Renderer adapters]() for <b>Vue 2</b>, <b>Preact</b>, <b>Svelte</b> and <b>SolidJS</b>
- Documentation refinements and more [boilerplate flavors]()
- Improving the development process as described below

## Running examples in development

This is perhaps an obvious area of improvement — in order to test the packages, you must call `npm run devinstall` from each example directory root <b>after every change</b>.

For instance, if you make changes to `packages/fastify-vite` and `packages/fastify-vite-vue`, you'll want to run `npm run devinstall` from `examples/base-vue` to test your changes.

 The reason for this is that there were some issues encountered trying to use `npm link` for this that couldn't be sorted out at the time. So for the time being development of this project relies on [devinstall.mjs](), which will actually copy each package to the example's `node_modules` folder, but hopefully [this will change any moment now]().


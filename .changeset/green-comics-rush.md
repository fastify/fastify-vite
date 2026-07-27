---
'@fastify/vue': major
---

Rewrite `@fastify/vue` in TypeScript

The package source is now TypeScript under `src/`, compiled to `dist/` with declaration files.
Every entrypoint now ships `types`, and a new
`./virtual` entrypoint provides declarations for the virtual modules (`$app/*`),
so route context, layouts and route modules are typed out of the box. Public types such as
`ViteFastifyVueOptions`, `RouteDefinition`, `VueRouteDefinition`, `ContextInit` and
`RouteContextLike` are exported from the root, and `useRouteContext` accepts a type parameter
for your own context shape.

The runtime API is unchanged. `prepareClient`, `createRoute`, `createErrorHandler`,
`createRenderFunction`, `createHtmlFunction`, `createRoutes` and `useRouteContext` keep
their existing names and behaviour.

**Breaking changes**, all related to installation requirements:

- `vue`, `vue-router` and `@unhead/vue` moved from `dependencies` to `peerDependencies`. They
  must now be installed explicitly in your project. This avoids duplicate Vue instances and lets
  you control the exact versions.
- `@unhead/vue` now requires `^3.0.0`, up from `^2.1.13`. Follow the Unhead v3 migration guide
  if you use it directly.
- `vite` is now an optional peer dependency requiring `^8.0.0`, and the minimum supported Node.js
  version is `22.6`.


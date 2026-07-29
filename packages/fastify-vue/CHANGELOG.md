# @fastify/vue

## 2.0.1

### Patch Changes

- Updated dependencies [03cf160]
  - @fastify/vite@10.0.0

## 2.0.0

### Major Changes

- f67a0e5: Rewrite `@fastify/vue` in TypeScript

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

## 1.2.3

### Patch Changes

- 0cba104: Bump to unhead v2.1.13
- 492e392: Upgrade devalue to v5.7.1 (security)

## 1.2.2

### Patch Changes

- 78f209e: Vite 8 compatibility fixes

## 1.2.1

### Patch Changes

- 34f6381: Fix html template parsing security issues
- 34f6381: Remove html-rewriter-wasm dependency

  Internal refactor to remove the stale html-rewriter-wasm dependency. No API changes.
  HTML manipulation now uses simple regex operations instead of WebAssembly-based parsing.

- Updated dependencies [34f6381]
- Updated dependencies [34f6381]
- Updated dependencies [34f6381]
- Updated dependencies [34f6381]
- Updated dependencies [34f6381]
- Updated dependencies [34f6381]
- Updated dependencies [34f6381]
- Updated dependencies [34f6381]
- Updated dependencies [34f6381]
- Updated dependencies [34f6381]
- Updated dependencies [34f6381]
- Updated dependencies [34f6381]
  - @fastify/vite@9.0.0

## 1.2.1-rc.1

### Patch Changes

- 8574892: Fix html template parsing security issues
- Updated dependencies [8574892]
  - @fastify/vite@9.0.0-rc.3

## 1.2.1-rc.0

### Patch Changes

- 937226e: Remove html-rewriter-wasm dependency

  Internal refactor to remove the stale html-rewriter-wasm dependency. No API changes.
  HTML manipulation now uses simple regex operations instead of WebAssembly-based parsing.

- Updated dependencies [2b60b32]
- Updated dependencies [41f488a]
- Updated dependencies [54d98d0]
- Updated dependencies [937226e]
- Updated dependencies [c6b8632]
- Updated dependencies [b65fd99]
- Updated dependencies [071a8ca]
- Updated dependencies [a2ef9b6]
  - @fastify/vite@9.0.0-rc.0

## 1.2.0

### Minor Changes

- c1ee10b: Added `key` and `meta` to route mapping

## 1.1.6

### Patch Changes

- 20d1a82: #295 fix: return reply in async handlers

## 1.1.5

### Patch Changes

- ad49933: Address polynomial RedDoS issue in route regex identified by CodeQL

## 1.1.4

### Patch Changes

- 58bc70a: Format all files with oxfmt
- Updated dependencies [58bc70a]
  - @fastify/vite@8.2.3

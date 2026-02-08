# @fastify/react

## 1.1.6-rc.0

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

## 1.1.5

### Patch Changes

- 20d1a82: #295 fix: return reply in async handlers

## 1.1.4

### Patch Changes

- ad49933: Address polynomial RedDoS issue in route regex identified by CodeQL

## 1.1.3

### Patch Changes

- 58bc70a: Format all files with oxfmt
- Updated dependencies [58bc70a]
  - @fastify/vite@8.2.3

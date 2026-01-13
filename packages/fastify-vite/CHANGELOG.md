# @fastify/vite

## 8.4.1

### Patch Changes

- 8abfaf8: Fix static routes to respect registration prefix. When registering @fastify/vite with a `prefix` option, static assets and public files are now correctly served under that prefix.

## 8.4.0

### Minor Changes

- bc8e057: Add TypeScript types to the `viteFastify` plugin and utils exports. #352

### Patch Changes

- 943af16: Check decorators before registering `@fastify/middie` internally. This should allow middie to be registered separately if users want to configure specific options.

## 8.3.1

### Patch Changes

- 31d2759: Fix a bug where using a relative path for `build.outDir` instead of an absolute path in vite configs did not work. #350

## 8.3.0

### Minor Changes

- 6af9432: Enable starting the fastify server from outside the project root

## 8.2.3

### Patch Changes

- 58bc70a: Format all files with oxfmt

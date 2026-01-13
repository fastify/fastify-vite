# Examples

This directory contains examples demonstrating how to use `@fastify/vite` with various frameworks and configurations.

## Dual Purpose

These examples serve two purposes:

1. **Usage Examples** — Reference implementations showing how to integrate Vite with Fastify for different use cases (React, Vue, SSR, SPA, TypeScript, etc.)

2. **Integration Tests** — Examples with a `server.test.js` file run as part of CI to ensure `@fastify/vite` works correctly across different configurations

## Running Tests

To run all example integration tests:

```bash
pnpm test:examples
```

To run tests for a specific example:

```bash
cd examples/react-vanilla
pnpm test
```

## Bug Reproductions

Some examples exist primarily to reproduce and test specific issues:

- `prefix-support` — Reproduces [issue #358](https://github.com/fastify/fastify-vite/issues/358) (static routes respect registration prefix)
- `relative-outdir` — Reproduces [issue #303](https://github.com/fastify/fastify-vite/issues/303) (nested root with relative outDir)

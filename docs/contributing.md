# Contributing

Currently [I'm](https://hire.jonasgalvez.com.br) the sole maintainer of this project.

New contributors would be extremely wecome.

The project needs at least an additional releaser.

GitHub issues need more active triaging.

Both **`@fastify/vue`** and **`@fastify/react`** are lacking a comprehensive test suite and more starter templates covering other potential configurations.

## Style

Please make sure to adhere to the following style conventions:

- **No tabs**
- **No semicolons**
- **Two-space indendation **
- **Singlequoted strings**

We use [`oxc`](https://oxc.rs/) which is extremely fast but doesn't perform this type of formatting.

## Development

**`@fastify/vite`**, **`@fastify/vue`** and **`@fastify/react`** live in the [same monorepo](https://github.com/fastify/fastify-vite) and are set up to work as a [**pnpm workspace**](https://pnpm.io/workspaces).

The `examples/` also serve as test suites, make sure to run `source ./test-all.sh` from that folder after making changes to `@fastify/vite`.

Last Updated: **November 23, 2023**
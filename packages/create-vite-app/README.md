# @fastify/create-vite-app

The official scaffolding tool for **Fastify + Vite** applications.

## Quick Start

You do not need to install this package globally. You can run it directly using your package manager of choice.

### npm
```bash
npm create @fastify/vite-app@latest
# or with a specific project name
npm create @fastify/vite-app@latest my-app
```

### pnpm
```bash
pnpm create @fastify/vite-app@latest
```

### yarn
```bash
yarn create @fastify/vite-app
```

If you don't provide a project name, the CLI will use `fastify-vite-app` by default.

```bash
# Creates a folder named "my-new-project"
npm create @fastify/vite-app my-new-project
```

Once created:

```bash
cd my-new-project
npm install
npm run dev
```

## Contributing

This package is part of the `fastify-vite` monorepo.

### Local Development

1.  Navigate to the package directory:

```bash
cd packages/create-vite-app
```

2.  Build the project (requires TypeScript):

```bash
npm run build
```

3.  Test it locally without publishing:

```bash
# Run the built output directly
node dist/index.js my-test-app
```

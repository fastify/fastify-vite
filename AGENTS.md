# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm workspace hosting multiple Fastify/Vite packages. Core modules live in `packages/`:
`packages/fastify-vite` (primary plugin), `packages/fastify-react`, `packages/fastify-vue`, and
`packages/fastify-htmx`. Reference implementations live in `examples/` (low-level integrations)
and `starters/` (DX-focused starter apps). Documentation assets are in `docs/` powered by vitepress.
Release metadata and versioning notes are stored in `.changeset/`.

## Build, Test, and Development Commands

- `pnpm install` installs workspace dependencies.
- `pnpm build` runs package builds across `packages/*` where available.
- `pnpm test` runs package tests (`vitest`) across `packages/*`.
- `pnpm test:examples` runs integration tests for `examples/*` projects.
- `pnpm lint` runs package lint scripts plus `oxlint` for repo-wide checks.
- `pnpm format` formats the repo with `oxfmt`; `pnpm format:check` verifies formatting.

## Coding Style & Naming Conventions

Formatting and linting are enforced with `oxfmt` and `oxlint` (see `.oxfmtrc.json` and
`.oxlintrc.json`). Code is typically JavaScript/TypeScript with no semicolons and single quotes.

## Testing Guidelines

This repo primarily relies on integration tests that live in `examples/*` to detect regressions.
Use `pnpm test:examples` to run all integration tests against all examples, or target a package,
e.g. `pnpm filter @fastify-vite/example-react-vanilla test` to run just a single example's tests.

A few unit tests are available in packages with Vitest. Use `pnpm test` for the full workspace or
target a package, e.g. `pnpm --filter @fastify/vite test`.

## Commit & Pull Request Guidelines

For changes that affect published package behavior, add a Changeset in `.changeset/`. This will
automatically help release new versions via GitHub Actions. This is not necessary for changes that
only affect internal tooling such as unit testing, linting, etc.
PRs should include a clear summary, testing notes, and links to related issues.

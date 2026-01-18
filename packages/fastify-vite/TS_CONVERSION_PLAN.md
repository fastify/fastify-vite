# TypeScript Conversion Plan for @fastify/vite

Goal: convert the runtime source in `packages/fastify-vite/` from JS to TS in small, low-risk steps while keeping existing public APIs intact, introduce a `src/` -> `dist/` layout, and end in a single ESM-only output with `.ts` sources.

This is a breaking change targeting `@fastify/vite@9.0.0` (see `docs/roadmap.md`). CJS support will be deprecated in favor of ESM-only output.

## Phase 0: Baseline and guardrails (completed)

1. Current entry points and module formats (from `packages/fastify-vite/package.json`):
   - `main`: `index.js` (CJS)
   - `exports`:
     - `.`: `import`/`require` -> `index.js`, `types` -> `types/index.d.ts`
     - `./utils`: `import`/`require` -> `utils.js`, `types` -> `types/utils.d.ts`
     - `./plugin`: `import` -> `plugin.mjs`, `types` -> `types/plugin.d.ts`
   - Published files: `config.js`, `html.js`, `index.js`, `ioutils.cjs`, `plugin.mjs`, `setup.js`, `utils.js`, `mode/*`, `types/*`
2. Tests baseline: `pnpm --filter @fastify/vite test` and `pnpm test:examples`
   - All tests passed; stderr included a Vite dep-scan warning for `fixtures/cjs/index.html` but no failures.
3. Runtime JS files to convert:
   - `config.js`, `html.js`, `index.js`, `setup.js`, `utils.js`
   - `mode/development.js`, `mode/production.js`
   - `plugin.mjs` (ESM), `ioutils.cjs` (CJS)

## Per-phase stop/go checklist

Use this at the end of each phase:

- Run `pnpm --filter @fastify/vite test` and `pnpm test:examples`.
- Verify package `exports` still resolve correctly for consumers.
- Confirm no regressions in examples that import `@fastify/vite` or `@fastify/vite/plugin`.
- If failures appear, fix or roll back the phase before continuing.
- Run `pnpm lint:fix` and then `pnpm format` from the root of the monorepo.
- **Mark the phase as completed** in this file by adding `(completed)` to the phase heading.
- **Create a git commit** at the end of each phase to checkpoint progress.
- Do not make multiple git commits per phase. Amend the one commit if needed.

## Phase 1: Create `src/` layout (minimal behavior change) (completed)

4. Add `src/` and move runtime source files into it (no code edits yet):
   - `src/config.js`, `src/html.js`, `src/index.js`, `src/setup.js`, `src/utils.js`
   - `src/mode/development.js`, `src/mode/production.js`
   - `src/plugin.mjs`, `src/ioutils.cjs`
   - Include all test files as well
5. Update any internal relative imports to reflect the `src/` location.
6. Update unit test imports to reference `src/` paths (no root-level proxy files).
7. Update `package.json` exports to point at the files' new locations in `src/`.

By the end of this phase, there should be no more JavaScript files in the package root.

## Phase 2: TypeScript build scaffolding (no runtime change)

8. Update the existing `tsconfig.json` to cover runtime sources with `declaration: true`, `declarationMap: true`, `sourceMap: true`, `emitDeclarationOnly: false`, and `outDir: dist/`.
9. Enable `allowJs: true` and `checkJs: false` initially to let TS compile existing JS as a no-op.
10. Add a `build` script for this package (or workspace) to emit `dist/` without changing exports yet.
11. Note: Unit tests (`pnpm test`) can run directly on `.ts` sources via Node.js 22+ type stripping. However, `pnpm test:examples` imports `@fastify/vite` from package exports, so CI must run `pnpm build` before `pnpm test:examples` once exports point to `dist/` (Phase 7).

## Phase 3: Preserve module formats with TS extensions (temporary)

12. Decide TS file extensions per module format:
    - Use `.mts` for ESM sources (current `plugin.mjs`).
    - Use `.cts` for CJS sources (current `ioutils.cjs`).
    - Use `.ts` for files that should emit CJS `.js` under the package default.

13. Update `tsconfig.json` `module`/`moduleResolution` to `NodeNext` so `.mts/.cts` emit `.mjs/.cjs` correctly.

## Phase 4: Incremental file conversions (small, low-risk first)

14. Convert `utils.js` to `utils.ts`, moving types from `types/utils.d.ts` into the source.
15. Convert `html.js` to `html.ts` and ensure any DOM/HTML types are explicit.
16. Convert `config.js` and `setup.js` to TS, adding minimal type annotations for options/config objects.
17. Convert `mode/development.js` and `mode/production.js` to TS, keeping runtime behavior unchanged.

## Phase 5: Core entry points and plugin surface

18. Convert `index.js` to `index.ts`, moving types from `types/index.d.ts` into the source.
19. Convert `plugin.mjs` to `plugin.mts`, moving types from `types/plugin.d.ts` into the source.
20. Convert `ioutils.cjs` to `ioutils.cts`, ensuring CJS interop is preserved (temporary until ESM-only phase).

## Phase 6: Types consolidation

21. Verify emitted `.d.ts` files in `dist/` are compatible with existing consumers.
22. Update `package.json` `types` and `exports` `types` entries to point to emitted declarations in `dist/` (keep handwritten files temporarily).

## Phase 7: Switch package exports to emitted output

23. Update `package.json` `main`/`exports` to point to `dist/` outputs.
24. Update `files` to include `dist/` and remove JS source files from publish list once stable.
25. Update `.github/workflows/integration-tests.yml` to run `pnpm build` before `pnpm test:examples`.
26. Keep a temporary validation window where both source and `dist/` are published (if needed).
27. Remove the handwritten `types/*.d.ts` files once `exports` `types` entries point to `dist/`.

## Phase 8: Tests, fixtures, and cleanup

28. Verify unit tests import from `src/` (relative paths) and integration tests (`examples/`) import via `@fastify/vite` (resolved through package exports to `dist/`).
29. Remove obsolete JS sources once TS build is the sole runtime source.
30. Add a changeset if package behavior or public exports change.

## Phase 9: Shift to ESM-only sources and outputs

31. Set package `type: "module"` and emit only `.js` ESM outputs.
32. Rename any `.mts`/`.cts` sources to `.ts` and update imports/exports accordingly.
33. Update `package.json` `main`/`exports` to ESM-only paths and remove CJS mappings.
34. Replace all `require` usage with `import` across the package and tests for ESM consistency (keep CJS fixtures for historical/compat coverage).

## Phase 10: Follow-up hardening

35. Tighten `noImplicitAny`/`strict` settings only after the TS migration is stable.
36. Add type-level tests to replace or extend current `types/*.test-d.ts` coverage.

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

## Phase 2: TypeScript build scaffolding (no runtime change) (completed)

8. Update the existing `tsconfig.json` to cover runtime sources with `declaration: true`, `declarationMap: true`, `sourceMap: true`, `emitDeclarationOnly: false`, and `outDir: dist/`.
9. Enable `allowJs: true` and `checkJs: false` initially to let TS compile existing JS as a no-op.
10. Add a `build` script for this package (or workspace) to emit `dist/` without changing exports yet.
11. Note: Unit tests (`pnpm test`) can run directly on `.ts` sources via Node.js 22+ type stripping. However, `pnpm test:examples` imports `@fastify/vite` from package exports, so CI must run `pnpm build` before `pnpm test:examples` once exports point to `dist/` (Phase 7).

## Phase 3: Preserve module formats with TS extensions (temporary) (completed)

12. Decide TS file extensions per module format:
    - Use `.mts` for ESM sources (current `plugin.mjs`).
    - Use `.cts` for CJS sources (current `ioutils.cjs`).
    - Use `.ts` for files that should emit CJS `.js` under the package default.

13. Update `tsconfig.json` `module`/`moduleResolution` to `NodeNext` so `.mts/.cts` emit `.mjs/.cjs` correctly.

## Phase 4: Switch package exports to emitted output (start building before examples) (completed)

14. Update `tsconfig.json` to include `src/` runtime sources so `pnpm build` emits `dist/`.
15. Add/update a `build` script if needed and ensure it outputs to `dist/`.
16. Update `package.json` `main`/`exports` to point to `dist/` outputs.
17. Update `files` to include `dist/` and remove JS source files from publish list once stable.
18. Update `.github/workflows/integration-tests.yml` to run `pnpm build` before `pnpm test:examples`.
19. From this phase onward, always run `pnpm build` before `pnpm test:examples`.

## Phase 5: Leaf conversions (no internal dependencies) (completed)

20. Convert `html.js` to `html.ts` and ensure any DOM/HTML types are explicit.
21. Confirm `ioutils.cts` is stable as the base internal utility module (no change unless adding types).
22. Convert `setup.js` to `setup.ts`, adding minimal type annotations for options/config objects.
23. Convert `utils.js` to `utils.ts`, moving types from `types/utils.d.ts` into the source.

## Phase 6: Config and mode conversions (depend on leaf modules)

24. Convert `config.js` to TS, splitting it into smaller modules first to keep types scoped and make the largest runtime file easier to annotate and review (completed):
    - Move code without behavior changes; update internal imports to point at the new modules.
    - Update `src/config.js` each time a helper is moved so the change is reviewable atomically.
    - Pause and allow me to review after splitting each module out.
    - `src/config/environments.ts`: `createClientEnvironment`, `createSSREnvironment`.
    - `src/config/defaults.ts`: `DefaultConfig` and renderer hook wiring.
    - `src/config/paths.ts`: `resolveRoot`, `resolveClientModule`, `findConfigFile`, `findViteConfigJson`, `getApplicationRootDir`.
    - `src/config/vite-config.ts`: `resolveViteConfig`.
    - `src/config/bundle.ts`: `resolveSSRBundle`, `resolveSPABundle`. (completed)
    - `src/config/types.ts`: config, bundle, and renderer hook types (use `import type` from `fastify`). (completed)
    - Keep `src/config.ts` as the public surface (`configure`, re-exports) and preserve default export behavior.
25. Convert `mode/development.js` to TS, keeping runtime behavior unchanged.
26. Convert `mode/production.js` to TS, keeping runtime behavior unchanged.

## Phase 7: Entry points and plugin surface (depend on config/mode)

27. Convert `plugin.mjs` to `plugin.mts`, moving types from `types/plugin.d.ts` into the source.
28. Convert `index.js` to `index.ts`, moving types from `types/index.d.ts` into the source.

## Phase 8: Types consolidation

29. Verify emitted `.d.ts` files in `dist/` are compatible with existing consumers.
30. Update `package.json` `types` and `exports` `types` entries to point to emitted declarations in `dist/` (keep handwritten files temporarily).

## Phase 9: Types cleanup

31. Remove the handwritten `types/*.d.ts` files once `exports` `types` entries point to `dist/`.

## Phase 10: Tests, fixtures, and cleanup

32. Verify unit tests import from `src/` (relative paths) and integration tests (`examples/`) import via `@fastify/vite` (resolved through package exports to `dist/`).
33. Remove obsolete JS sources once TS build is the sole runtime source.
34. Add a changeset if package behavior or public exports change.

## Phase 11: Shift to ESM-only sources and outputs

35. Set package `type: "module"` and emit only `.js` ESM outputs.
36. Rename any `.mts`/`.cts` sources to `.ts` and update imports/exports accordingly.
37. Update `package.json` `main`/`exports` to ESM-only paths and remove CJS mappings.
38. Replace all `require` usage with `import` across the package and tests for ESM consistency (keep CJS fixtures for historical/compat coverage).

## Phase 12: Follow-up hardening

39. Tighten `noImplicitAny`/`strict` settings only after the TS migration is stable.
40. Add type-level tests to replace or extend current `types/*.test-d.ts` coverage.

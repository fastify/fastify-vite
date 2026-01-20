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

## Phase 6: Config and mode conversions (depend on leaf modules) (completed)

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
25. Convert `mode/development.js` to TS, keeping runtime behavior unchanged. (completed)
26. Convert `mode/production.js` to TS, keeping runtime behavior unchanged. (completed)

## Phase 7: Entry points and plugin surface (depend on config/mode) (completed)

27. Convert `plugin.mjs` to `plugin.mts`, moving types from `types/plugin.d.ts` into the source. (completed)
28. Convert `index.js` to `index.ts`, moving types from `types/index.d.ts` into the source. (completed)

## Phase 8: Types consolidation (completed)

29. Verify emitted `.d.ts` files in `dist/` are compatible with existing consumers. (completed)
30. Update `package.json` `types` and `exports` `types` entries to point to emitted declarations in `dist/` (keep handwritten files temporarily). (completed)

## Phase 9: Types cleanup (completed)

31. Remove the handwritten `types/*.d.ts` files once `exports` `types` entries point to `dist/`. (completed)
    - Removed `types/index.d.ts`, `types/plugin.d.ts`, `types/utils.d.ts`.
    - Kept `types/index.test-d.ts` and `types/plugin.test-d.ts` for type testing.
    - Updated `types/plugin.test-d.ts` to import from `../dist/plugin.mjs`.
    - Updated `files` array in `package.json` to remove `types/*.d.ts` entries.

## Phase 10: Tests, fixtures, and cleanup (completed)

32. Verify unit tests import from `src/` (relative paths) and integration tests (`examples/`) import via `@fastify/vite` (resolved through package exports to `dist/`). (completed)
    - `src/html.test.js` imports from `./html.ts` (relative to src).
    - `src/index.test.js` imports from `../fixtures/` which import from `../../src/index.js` and `../../src/index.ts`.
    - Examples import from `@fastify/vite` via package exports resolving to `dist/`.
33. Remove obsolete JS sources once TS build is the sole runtime source. (completed)
    - Removed `src/mode/development.js` and `src/mode/production.js` (CJS shims that were no longer used).
34. Add a changeset if package behavior or public exports change. (completed)
    - No changeset needed; public API unchanged. Existing changeset covers the 9.0.0 release.

## Phase 11: Shift to ESM-only sources and outputs (completed)

35. Set package `type: "module"` and emit only `.js` ESM outputs. (completed)
    - Added `"type": "module"` to package.json.
36. Rename any `.mts`/`.cts` sources to `.ts` and update imports/exports accordingly. (completed)
    - Renamed `src/plugin.mts` to `src/plugin.ts`.
    - Renamed `src/plugin.test.mts` to `src/plugin.test.ts`.
    - Updated tsconfig.json exclude pattern from `.test.mts` to `.test.ts`.
    - Updated import in `plugin.test.ts` from `./plugin.mts` to `./plugin.ts`.
    - Updated import in `types/plugin.test-d.ts` from `../dist/plugin.mjs` to `../dist/plugin.js`.
37. Update `package.json` `main`/`exports` to ESM-only paths and remove CJS mappings. (completed)
    - Removed `require` entries from all exports.
    - Updated `./plugin` export types from `./dist/plugin.d.mts` to `./dist/plugin.d.ts`.
    - Updated `./plugin` export import from `./dist/plugin.mjs` to `./dist/plugin.js`.
38. Replace all `require` usage with `import` across the package and tests for ESM consistency (keep CJS fixtures for historical/compat coverage). (completed)
    - Removed `require('..')` from `types/index.test-d.ts` and replaced with ESM import.
    - Renamed `fixtures/cjs/server.js` to `fixtures/cjs/server.cjs` to preserve CJS behavior.
    - Updated `src/index.test.js` import to reference `.cjs` file.
    - Updated `fixtures/esm/server.js` import to use `.ts` extension.

## Phase 12: Dev mode typing (completed)

39. Replace the `baseConfig`/`mergeConfig` casts in `packages/fastify-vite/src/mode/development.ts:90` and `packages/fastify-vite/src/mode/development.ts:100` with `InlineConfig`/`UserConfig` so `devServerOptions` is typed without `any`. (completed)
40. Type the Vite dev middleware bridge at `packages/fastify-vite/src/mode/development.ts:103` using `ViteDevServer['middlewares']` (or `Connect.Server`) so `scope.use` no longer needs `as any`. (completed)
    - Imported `Handler as MiddieHandler` from `@fastify/middie` and cast middlewares appropriately.
41. Type entry loading in `packages/fastify-vite/src/mode/development.ts:126` and `packages/fastify-vite/src/mode/development.ts:129` by narrowing the `entryModule` default export to `ClientModule` and keep `entries` as `ClientEntries`. (completed)
    - Added `LoadedEntryModule` interface for modules loaded via ModuleRunner.
    - Updated `SetupContext.entries` to use `ClientEntries` type.
42. Add typed HMR state/scope and update the dev-mode setup context so route hydration no longer relies on `any` at `packages/fastify-vite/src/mode/development.ts:151`, `packages/fastify-vite/src/mode/development.ts:155`, and `packages/fastify-vite/src/mode/development.ts:188`: (completed)
    - Added `HotState` and `HotScope` interfaces.
    - Added `hasIterableRoutes` type guard for proper narrowing.
    - Used type assertion after decoration to access hot state safely.

    ```ts
    interface HotState {
      client?: ClientModule
      routeHash?: Map<string, RouteDefinition>
    }

    interface HotScope extends FastifyInstance {
      [hot]: HotState
    }

    interface SetupContext {
      scope: FastifyInstance // HotScope used after decoration
      devServer: ViteDevServer
      entries: ClientEntries
      runners: Record<string, ModuleRunner>
    }
    ```

## Phase 13: Production typing (completed)

43. Remove prod-mode `any` for output directories and assets access by narrowing `config.vite` with a discriminated union so `packages/fastify-vite/src/mode/production.ts:56` and `packages/fastify-vite/src/mode/production.ts:62` stop using `as ResolvedConfig as any`. (completed)
    - Created `DevRuntimeConfig` and `ProdRuntimeConfig` discriminated union types.
    - Updated `production.ts` to use `ProdRuntimeConfig` and access `vite.build.outDir`/`vite.build.assetsDir` without `as any` casts.
    - Updated `development.ts` to use `DevRuntimeConfig` and remove unnecessary `as ResolvedConfig` casts.
44. Add `prefix?: string` to `ConfigOptions`/`FastifyViteOptions` and use it to remove `(config as any).prefix` at `packages/fastify-vite/src/mode/production.ts:72`. (completed)
    - Added `prefix?: string` to `ConfigOptions` in `types.ts`.
    - Added `prefix?: string` to `FastifyViteOptions` in `index.ts`.
    - Updated `production.ts` to use `config.prefix` directly.
45. Type `prepareClient`/`createRenderFunction` usage in `packages/fastify-vite/src/mode/production.ts:112`, `packages/fastify-vite/src/mode/production.ts:120`, and `packages/fastify-vite/src/mode/production.ts:124` with `ClientEntries`/`ClientModule` so `client` and `routes` return types are no longer cast. (completed)
    - Updated `prepareClient` return type in `ConfigOptions` from `Promise<unknown>` to `Promise<ClientModule | undefined>`.
    - Updated `production.ts` to explicitly type `client` as `ClientModule | undefined`.
    - Removed `as any` casts from `prepareClient` and `createRenderFunction` calls.
    - Removed unused `viteConfig` parameter from `loadBundle` helper function.
46. Switch `RuntimeConfig.vite` to a discriminated union so dev/prod paths narrow safely: (completed)

    ```ts
    interface DevRuntimeConfig extends BaseRuntimeConfig {
      dev: true
      vite: ExtendedResolvedViteConfig
    }

    interface ProdRuntimeConfig extends BaseRuntimeConfig {
      dev: false
      vite: ExtendedResolvedViteConfig | SerializableViteConfig
    }

    export type RuntimeConfig = DevRuntimeConfig | ProdRuntimeConfig
    ```

    - Exported `DevRuntimeConfig` and `ProdRuntimeConfig` types for consumers.

## Phase 14: Type imports and consolidation (completed)

47. Replace local Vite config loader types with Vite exports (`UserConfigExport`, `UserConfigFn`) in `packages/fastify-vite/src/config/vite-config.ts:7`. (completed)
    - Imported `ConfigEnv` and `UserConfigExport` from Vite.
    - Created `ExtendedUserConfigFn` type that uses Vite's `ConfigEnv`.
    - Updated `UserConfigModule` to include `UserConfigExport`.
    - Changed `ssrBuild` to `isSsrBuild` to align with Vite's `ConfigEnv` interface.
48. Replace `bundle.manifest` types with `Manifest` in `packages/fastify-vite/src/types.ts:32` and `packages/fastify-vite/src/types.ts:38`. (completed)
    - Imported `Manifest` from Vite.
    - Updated `BundleInfo.manifest` to use `Manifest` type.
    - Merged `Bundle` as a deprecated type alias for `BundleInfo`.
    - Fixed `bundle.ts` to use empty object `{}` instead of array `[]` for dev mode manifest.
49. Replace `ssrManifest` with `Manifest` (or `Manifest | undefined`) in `packages/fastify-vite/src/types.ts:190`. (completed)
    - Updated `BaseRuntimeConfig.ssrManifest` to use `Manifest` type.
50. Consolidate duplicate and overlapping types by merging `BundleInfo`/`Bundle` (`packages/fastify-vite/src/types.ts:31`, `packages/fastify-vite/src/types.ts:37`), moving `RouteType`/`Ctx`/`RendererOption` from `packages/fastify-vite/src/index.ts` into `packages/fastify-vite/src/types.ts`, and replacing inline args with `CreateRouteArgs` (`packages/fastify-vite/src/config/defaults.ts:86`, `packages/fastify-vite/src/types.ts:129`). (completed)
    - Moved `Loosen`, `RouteType`, `Ctx`, `RendererFunctions`, `RendererOption` from `index.ts` to `types.ts`.
    - Added `ClientRouteArgs` type for the common `{ client, route }` pattern.
    - Updated `CreateRouteHandler` and `CreateErrorHandler` to use `ClientRouteArgs`.
    - Made `CreateRouteArgs` extend `ClientRouteArgs`.
    - Updated `defaults.ts` to use `ClientRouteArgs` type.
    - Updated `FastifyViteOptions.bundle.manifest` to use `Manifest` type.
    - Re-exported all moved types from `index.ts` for consumers.

## Phase 15: Strictness and verification

51. Enable `noImplicitAny: true` in `packages/fastify-vite/tsconfig.json` and fix resulting errors within `@fastify/vite` only.
52. Keep `types/*.test-d.ts` but focus on public API assertions (plugin options shape, Fastify reply augmentation, `RuntimeConfig`/`RenderContext`) and run `pnpm --filter @fastify/vite test`, `pnpm test:examples`, `pnpm lint:fix`, and `pnpm format`.

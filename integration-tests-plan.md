# Plan: Split Tests into Separate CI Workflows

Related issue: https://github.com/fastify/fastify-vite/issues/333

## Current State

Tests are orchestrated via `zx package.mjs --test` which:

1. Runs `vitest run` in `packages/fastify-vite`
2. Loops through a **hardcoded list** of 13 examples and runs `node --test` in each
3. Requires a `process.stdout.isTTY` check, forcing CI to use a TTY hack:
   ```yaml
   shell: 'script --return --quiet --command "bash {0}"'
   ```

### Problems

- Manual orchestration instead of standard pnpm patterns
- Hardcoded example list (new examples won't be tested unless list is updated)
- TTY hack required in CI
- Unit tests and integration tests coupled in one workflow

## Proposed Solution

Replace `zx package.mjs --test` with two filtered pnpm commands:

```bash
# Unit tests (packages)
pnpm --filter './packages/*' run --if-present test

# Integration tests (examples)
pnpm --filter './examples/*' run test
```

### Benefits

- Eliminates `package.mjs` test orchestration
- No more TTY hack needed in CI
- New examples automatically tested (no hardcoded list)
- Clean separation for separate CI workflows
- Standard pnpm monorepo idiom

## Implementation Steps

1. Update root `package.json` scripts:
   ```json
   {
     "scripts": {
       "test": "pnpm --filter './packages/*' run --if-present test",
       "test:examples": "pnpm --filter './examples/*' run test"
     }
   }
   ```

2. Create new CI workflow `.github/workflows/integration-tests.yml` for example tests

3. Update `.github/workflows/ci.yml`:
   - Remove the `script` shell hack
   - Run only `pnpm test` (unit tests)

4. Remove `runAllTests()` function and `--test` flag handling from `package.mjs`

## Notes

- Only `packages/fastify-vite` currently has a test script; other packages don't have tests
- All 13 examples have `"test": "node --test"` scripts
- Using `--if-present` for packages avoids failures if a package lacks a test script
- Omitting `--if-present` for examples ensures new examples must include tests

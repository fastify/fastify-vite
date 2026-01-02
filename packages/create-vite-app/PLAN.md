# Implementation Plan: @fastify/create-vite-app CLI

## Overview
Build a CLI scaffolding tool that copies the `examples/react-vanilla-spa/` template and resolves pnpm catalog versions at build time.

## Requirements Summary
- **Template source**: `examples/react-vanilla-spa/` (no dedicated templates folder)
- **Prompts**: Project name only (using @clack/prompts)
- **Versions**: Baked in at build time from `pnpm-workspace.yaml`
- **Post-scaffold**: Auto-detect package manager and install dependencies
- **Skip**: test files, node_modules, dist folders

---

## Implementation Steps

### Step 1: Add dependencies
**File**: `packages/create-vite-app/package.json`

Add:
- `@clack/prompts` - interactive CLI prompts
- `yaml` (devDependency) - parse pnpm-workspace.yaml at build time

### Step 2: Create build script to generate versions
**New file**: `packages/create-vite-app/scripts/generate-versions.ts`

This script will:
1. Read `../../pnpm-workspace.yaml` for catalog versions
2. Read `../fastify-vite/package.json` for @fastify/vite version (workspace:^ reference)
3. Parse catalog and catalogs sections
4. Write `src/versions.ts` with resolved versions:
```ts
export const versions = {
  '@fastify/vite': '^8.2.3',
  'fastify': '^5.6.2',
  'vite': '^7.3.0',
  'react': '^19.2.3',
  'react-dom': '^19.2.3',
  '@vitejs/plugin-react': '^5.1.2',
}
```

### Step 3: Update build script in package.json
**File**: `packages/create-vite-app/package.json`

Change build to:
```json
"build": "node scripts/generate-versions.ts && tsc"
```

(Uses Node 22.18+ native TypeScript support - no tsx needed)

### Step 4: Rewrite src/index.ts
**File**: `packages/create-vite-app/src/index.ts`

Structure:
```ts
#!/usr/bin/env node
import * as p from '@clack/prompts'
import { versions } from './versions.js'
// ... fs utilities

async function main() {
  p.intro('Create Fastify + Vite App')

  // 1. Get project name (with CLI arg fallback)
  const projectName = await p.text({...})

  // 2. Copy template files from examples/react-vanilla-spa
  //    - Skip: node_modules, dist, *.test.js
  //    - Transform package.json with resolved versions

  // 3. Detect package manager (npm/pnpm/yarn/bun)
  // 4. Run install with spinner

  p.outro('Done! Run: cd <project> && npm run dev')
}
```

### Step 5: Add template copying logic
**File**: `packages/create-vite-app/src/index.ts`

Key functions:
- `copyTemplate(source, dest)` - recursively copy, skip ignored files
- `transformPackageJson(content, projectName, versions)` - replace workspace:/catalog: refs
- `detectPackageManager()` - check lockfiles or npm_config_user_agent
- `installDependencies(pm, cwd)` - spawn install process

---

## Files to Modify/Create

| File | Action |
|------|--------|
| `packages/create-vite-app/package.json` | Modify - add deps, update build script |
| `packages/create-vite-app/scripts/generate-versions.ts` | Create |
| `packages/create-vite-app/src/versions.ts` | Generated (gitignored) |
| `packages/create-vite-app/src/index.ts` | Rewrite |
| `packages/create-vite-app/.gitignore` | Create - ignore src/versions.ts |

---

## Template Files Copied (from examples/react-vanilla-spa/)

```
project-name/
├── client/
│   ├── base.css
│   ├── base.jsx
│   ├── index.html
│   └── mount.js
├── package.json      (transformed)
├── server.js
└── vite.config.js
```

---

## Version Mapping

| Source Reference | Package | Resolved |
|-----------------|---------|----------|
| `workspace:^` | @fastify/vite | ^8.2.3 |
| `catalog:` | fastify | ^5.6.2 |
| `catalog:` | vite | ^7.3.0 |
| `catalog:react` | react | ^19.2.3 |
| `catalog:react` | react-dom | ^19.2.3 |
| `catalog:react` | @vitejs/plugin-react | ^5.1.2 |

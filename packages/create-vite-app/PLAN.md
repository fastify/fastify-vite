# Implementation Plan: @fastify/create-vite-app CLI

## Overview
Build a CLI scaffolding tool that copies the `examples/react-vanilla-spa/` template and resolves pnpm catalog versions at build time.

## Requirements Summary
- **Template source**: `examples/react-vanilla-spa/` (bundled at build time)
- **Prompts**: Project name only (using @clack/prompts)
- **Versions**: Baked in at build time from `pnpm-workspace.yaml`
- **Post-scaffold**: Auto-detect package manager and install dependencies
- **Skip**: test files, node_modules, dist folders

---

## Implementation (Completed)

### Step 1: Add dependencies
**File**: `packages/create-vite-app/package.json`

Added:
- `@clack/prompts` ^0.11.0 - interactive CLI prompts
- `yaml` ^2.8.2 (devDependency) - parse pnpm-workspace.yaml at build time

### Step 2: Create build script
**File**: `packages/create-vite-app/scripts/generate-versions.ts`

This script:
1. Reads `pnpm-workspace.yaml` for catalog versions
2. Reads `packages/fastify-vite/package.json` for @fastify/vite version
3. Writes `src/versions.json` with resolved versions
4. Copies template files from `examples/react-vanilla-spa` to `templates/react-spa`

### Step 3: Update build script in package.json
**File**: `packages/create-vite-app/package.json`

```json
"build": "node scripts/generate-versions.ts && tsc"
```

(Uses Node 22.18+ native TypeScript support - no tsx needed)

### Step 4: Rewrite src/index.ts
**File**: `packages/create-vite-app/src/index.ts`

Features:
- Interactive project name prompt using @clack/prompts
- Copies template files from bundled `templates/react-spa`
- Transforms package.json (resolves versions, updates name)
- Auto-detects package manager and installs dependencies
- Shows spinner during operations

### Step 5: Create .gitignore
**File**: `packages/create-vite-app/.gitignore`

Ignores build-time generated files:
- `src/versions.json`
- `templates/`

---

## Files Modified/Created

| File | Action |
|------|--------|
| `packages/create-vite-app/package.json` | Modified - added deps, updated build script |
| `packages/create-vite-app/scripts/generate-versions.ts` | Created |
| `packages/create-vite-app/src/versions.json` | Generated (gitignored) |
| `packages/create-vite-app/src/index.ts` | Rewritten |
| `packages/create-vite-app/.gitignore` | Created |
| `packages/create-vite-app/templates/` | Generated (gitignored) |

---

## Generated Project Structure

```
project-name/
├── client/
│   ├── base.css
│   ├── base.jsx
│   ├── index.html
│   └── mount.js
├── package.json      (transformed with resolved versions)
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

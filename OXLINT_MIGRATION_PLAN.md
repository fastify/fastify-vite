# Oxlint Migration Plan for fastify-vite Monorepo

## Executive Summary

**Current State**: Monorepo uses 3 different linters (oxlint v0.9.10/v0.16.6, ESLint, Biome) inconsistently across 40+ packages.

**Target State**: Single oxlint v1.36.0 + oxfmt v0.21.0 installation at root (full Oxc toolchain).

**Effort**: Medium (2-3 hours) - Mostly config file changes and dependency cleanup.

**Performance Improvement**: 50-100x faster linting + 30x faster formatting.

**Configuration Required**: ZERO! Both oxlint and oxfmt work perfectly with defaults.

---

## Latest Oxlint Information

- **Latest Version**: `1.36.0` (released 2025)
- **Current Versions in Repo**:
  - Root: `0.9.10` (severely outdated)
  - Catalog: `0.16.6` (outdated)
- **Total Rules Available**: 645 rules across multiple categories
- **Supported File Types**: `.js`, `.jsx`, `.ts`, `.tsx`, `.vue`, `.svelte`, `.astro`

### Available Rule Categories

| Category | Description | Example Rules |
|----------|-------------|---------------|
| **eslint** | Core JavaScript rules | `no-unused-vars`, `no-const-assign`, `eqeqeq` |
| **typescript** | TypeScript-specific rules | `no-explicit-any`, `no-misused-promises`, `await-thenable` |
| **react** | React best practices | `jsx-key`, `rules-of-hooks`, `exhaustive-deps` |
| **unicorn** | Code quality improvements | `prefer-string-starts-ends-with`, `no-array-reduce` |
| **import** | Import/export management | `no-cycle`, `no-unresolved`, `no-duplicates` |
| **jsx-a11y** | Accessibility rules | `alt-text`, `aria-props`, `label-has-associated-control` |
| **jest** | Jest testing rules | Test-specific best practices |
| **node** | Node.js rules | Node.js-specific patterns |
| **promise** | Promise handling | Promise usage patterns |
| **vue** | Vue.js rules | Vue component rules |
| **nextjs** | Next.js rules | Next.js-specific patterns |

---

## Formatter Choice: oxfmt (Full Oxc Toolchain)

Since oxlint has "no support for stylistic rules" by design, you need a separate formatter.

### oxfmt - Blazing Fast Formatting ⚡

**Package**: `oxfmt@^0.21.0` (published 2025-12-29)

**Why oxfmt?**
- ✅ **Unified toolchain** - Both linter and formatter from Oxc project
- ✅ **30x faster than Prettier**
- ✅ **Prettier-compatible** formatting for JS/TS (can even read `.prettierrc` files!)
- ✅ **Single ecosystem** - Consistent updates, configuration, documentation
- ✅ **Comprehensive support** - JS, JSX, TS, TSX, Vue, CSS, JSON, YAML, Markdown, etc.
- ✅ **Native import sorting** and package.json sorting built-in
- ✅ **Very active development** - v0.21.0 released today (2025-12-29)!

**What about alpha status?**
- ⚠️ **Alpha status** - Still experimental (but functional and stable)
- ⚠️ **Default printWidth is 100** (vs Prettier's 80) - easily configurable
- ⚠️ **Some Prettier features unsupported** (plugins, package.json config)

**Is alpha acceptable?**
- ✅ **YES** - Formatters are low-risk (worst case: reformat once and switch)
- ✅ **Easy rollback** - If issues arise, can switch to Prettier in 5 minutes
- ✅ **Proven in practice** - Active community usage, frequent releases
- ✅ **Prettier-compatible** - Uses proven formatting approach

> 🎉 **Note**: oxfmt v0.21.0 was published on 2025-12-29 (today!), showing very active development.

---

## Migration Strategy: Oxlint + oxfmt

- **Oxlint (v1.36.0)**: All linting rules (errors, warnings, best practices, a11y)
- **oxfmt (v0.21.0)**: All formatting (Prettier-compatible)

**Rationale**:
1. **Unified Oxc ecosystem** - Both tools from the same project, consistent updates
2. **Maximum performance** - Oxlint (50-100x faster) + oxfmt (30x faster)
3. **Simpler mental model** - One toolchain to learn and configure
4. **Future-proof** - Oxc is actively developed and rapidly gaining adoption
5. **Low risk** - Formatters are easy to swap if needed

---

## Zero-Config Approach: Why It Works

### Single Root Installation for Mixed Frameworks ✅

**Your monorepo has**:
- React packages (fastify-react, react examples)
- Vue packages (fastify-vue, vue examples)
- Svelte packages (contrib/svelte-*)
- Solid packages (contrib/solid-*)
- HTMX packages (fastify-htmx)

**You only need ONE oxlint installation at root!** No per-package configs needed.

### How oxlint Handles Different Frameworks

Oxlint is **file-extension aware**:

| File Type | Rules Applied | Example Files |
|-----------|---------------|---------------|
| `.jsx`, `.tsx` | React rules (jsx-key, rules-of-hooks, etc.) | All React components |
| `.vue` | Vue rules | All Vue components |
| `.svelte` | Svelte-compatible rules | Svelte components |
| `.ts`, `.tsx` | TypeScript rules | Type definitions, TS files |
| `.js`, `.mjs`, `.cjs` | Core JavaScript rules | Config files, utilities |

**No manual configuration needed** - oxlint automatically applies the right rules based on file extension!

### What Gets Linted Automatically

Running `pnpm lint` from root will:
- ✅ Apply React rules to `packages/fastify-react/**/*.jsx`
- ✅ Apply Vue rules to `packages/fastify-vue/**/*.vue`
- ✅ Apply TypeScript rules to `**/*.ts` files
- ✅ Apply accessibility rules to all JSX/TSX files
- ✅ Skip node_modules, dist, build folders automatically

**Zero configuration required!**

---

## Detailed File Changes

### Phase 1: Root Configuration Files

#### 1.1 Update `/package.json`

**Before**:
```json
{
  "scripts": {
    "build": "pnpm -r run build",
    "lint": "oxlint --fix",
    "test": "zx package.mjs --test",
    "prep-for-dev": "zx package.mjs --prep-for-dev",
    "prep-for-release": "zx package.mjs --prep-for-release"
  },
  "private": "true",
  "devDependencies": {
    "oxlint": "^0.9.10",
    "vite": "catalog:",
    "vitest": "catalog:",
    "zx": "^8.8.5"
  }
}
```

**After**:
```json
{
  "scripts": {
    "build": "pnpm -r run build",
    "lint": "oxlint .",
    "lint:fix": "oxlint --fix .",
    "format": "oxfmt .",
    "format:check": "oxfmt --check .",
    "test": "zx package.mjs --test",
    "prep-for-dev": "zx package.mjs --prep-for-dev",
    "prep-for-release": "zx package.mjs --prep-for-release"
  },
  "private": "true",
  "devDependencies": {
    "oxlint": "^1.36.0",
    "oxfmt": "^0.21.0",
    "vite": "catalog:",
    "vitest": "catalog:",
    "zx": "^8.8.5"
  }
}
```

**Changes**:
- ✅ Update `oxlint` from `^0.9.10` → `^1.36.0`
- ✅ Add `oxfmt: ^0.21.0` to root devDependencies
- ✅ Update `lint` script to `oxlint .`
- ✅ Add `lint:fix` script for auto-fixing
- ✅ Add `format` and `format:check` scripts for oxfmt

#### 1.2 Update `/pnpm-workspace.yaml`

**Before**:
```yaml
packages:
  - docs/
  - packages/**
  - examples/*
  - contrib/*
  - starters/*

catalog:
  devalue: ^5.6.1
  fastify: ^5.6.2
  html-rewriter-wasm: ^0.4.1
  oxlint: ^0.16.6
  tsx: ^4.21.0
  typescript: ^5.9.3
  vite: ^7.3.0
  vitest: ^4.0.16
```

**After**:
```yaml
packages:
  - docs/
  - packages/**
  - examples/*
  - contrib/*
  - starters/*

catalog:
  devalue: ^5.6.1
  fastify: ^5.6.2
  html-rewriter-wasm: ^0.4.1
  tsx: ^4.21.0
  typescript: ^5.9.3
  vite: ^7.3.0
  vitest: ^4.0.16
```

**Changes**:
- ❌ **REMOVE** `oxlint: ^0.16.6` from catalog (will use root version only)

#### 1.3 Create `/oxlintrc.json` (OPTIONAL - Skip This!)

**You probably DON'T need this file!** Oxlint is designed to work without configuration and has excellent defaults.

**Skip creating this file unless** you want to:
- Disable specific rules (e.g., `unicorn/filename-case`)
- Change rule severity levels
- Add custom ignore patterns beyond the defaults

Oxlint automatically:
- ✅ Applies React rules to `.jsx`/`.tsx` files
- ✅ Applies Vue rules to `.vue` files
- ✅ Applies TypeScript rules to `.ts`/`.tsx` files
- ✅ Ignores `node_modules`, `dist`, etc.

**If you do want to customize**, here's an example:
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "rules": {
    "unicorn/filename-case": "off"
  }
}
```

**Recommendation**: Start with zero config, only add this later if you need customization.

#### 1.4 Create `/oxfmt.config.json` (Optional)

**New File**:
```json
{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxfmt/configuration_schema.json",
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always",
  "organizeImports": true
}
```

**Purpose**: Root-level formatting configuration. Note: oxfmt works great without config (Prettier-compatible defaults), but you can customize if needed.

**Alternative**: You can also configure oxfmt via `.prettierrc` files - oxfmt reads Prettier configs!

#### 1.5 Update `/.vscode/settings.json` (VSCode Extension Setup)

**Current State**: Your VSCode is configured to use the built-in TypeScript formatter.

**Why update this?**
- Developers get **real-time linting feedback** in their editor
- **Format on save** with oxfmt
- Consistent experience between CLI and editor

**Before**:
```json
{
	"editor.tabSize": 2,
	"[javascript]": {
		"editor.defaultFormatter": "vscode.typescript-language-features",
	},
	"javascript.format.semicolons": "remove",
	"typescript.format.semicolons": "remove",
	"javascript.preferences.quoteStyle": "auto",
	"typescript.preferences.quoteStyle": "auto",
	"[markdown]": {
		"editor.formatOnSave": false,
	}
}
```

**After**:
```json
{
	"editor.tabSize": 2,
	"editor.formatOnSave": true,
	"editor.defaultFormatter": "oxc.oxc-vscode",
	"[javascript]": {
		"editor.defaultFormatter": "oxc.oxc-vscode"
	},
	"[typescript]": {
		"editor.defaultFormatter": "oxc.oxc-vscode"
	},
	"[javascriptreact]": {
		"editor.defaultFormatter": "oxc.oxc-vscode"
	},
	"[typescriptreact]": {
		"editor.defaultFormatter": "oxc.oxc-vscode"
	},
	"[vue]": {
		"editor.defaultFormatter": "oxc.oxc-vscode"
	},
	"[markdown]": {
		"editor.formatOnSave": false
	},
	"oxc.enable": true,
	"oxc.fmt.experimental": true
}
```

**Changes**:
- ✅ Enable Oxc extension (`oxc.enable: true`)
- ✅ Enable experimental oxfmt formatter (`oxc.fmt.experimental: true`)
- ✅ Set oxfmt as default formatter for JS/TS/JSX/TSX/Vue
- ✅ Enable format on save globally
- ✅ Remove old TypeScript-specific formatting settings (no longer needed)

**Note**: Developers need to install the [Oxc VSCode extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) from the marketplace.

#### 1.6 Create `/.vscode/extensions.json` (Recommended Extensions)

**New File** (Optional but recommended):
```json
{
	"recommendations": [
		"oxc.oxc-vscode"
	]
}
```

**Purpose**: When developers open the repo, VSCode will prompt them to install the Oxc extension.

---

### Phase 2: Remove Oxlint from Individual Packages

Remove `oxlint` from `devDependencies` in the following package.json files:

#### 2.1 Starters (4 files)

- ❌ `/starters/react-base/package.json` - Remove `"oxlint": "catalog:"`
- ❌ `/starters/react-typescript/package.json` - Remove `"oxlint": "catalog:"`
- ❌ `/starters/react-kitchensink/package.json` - Remove `"oxlint": "catalog:"`
- ❌ `/starters/vue-typescript/package.json` - Remove `"oxlint": "catalog:"`

#### 2.2 Examples - React (7 files)

- ❌ `/examples/react-vanilla/package.json` - Remove `"oxlint": "catalog:"`
- ❌ `/examples/react-vanilla-spa/package.json` - Remove `"oxlint": "catalog:"`
- ❌ `/examples/react-vanilla-spa-ts/package.json` - Remove `"oxlint": "catalog:"`
- ❌ `/examples/react-vanilla-ts/package.json` - Remove `"oxlint": "catalog:"`
- ❌ `/examples/react-hydration/package.json` - Remove `"oxlint": "catalog:"`
- ❌ `/examples/react-next-mini/package.json` - Remove `"oxlint": "catalog:"`
- ❌ `/examples/react-streaming/package.json` - Remove `"oxlint": "catalog:"`

#### 2.3 Examples - Vue (3 files)

- ❌ `/examples/vue-vanilla/package.json` - Remove `"oxlint": "catalog:"`
- ❌ `/examples/vue-vanilla-spa/package.json` - Remove `"oxlint": "catalog:"`
- ❌ `/examples/vue-vanilla-ts/package.json` - Remove `"oxlint": "catalog:"`

---

### Phase 3: Remove/Update Lint Scripts

#### 3.1 Remove Lint Scripts from All Packages

**Remove `"lint"` script from**:

**Core Packages** (4 files):
- `/packages/fastify-vite/package.json` - Remove `"lint": "biome check --write ."`
- `/packages/fastify-react/package.json` - Remove `"lint": "biome check --apply-unsafe ."`
- `/packages/fastify-htmx/package.json` - Remove `"lint": "biome check --apply ."`
- `/packages/fastify-vue/package.json` - No lint script (no action needed)

**Starters** (6 files):
- `/starters/react-base/package.json` - Remove `"lint": "oxlint"`
- `/starters/react-typescript/package.json` - Remove `"lint": "oxlint"`
- `/starters/react-kitchensink/package.json` - Remove `"lint": "oxlint"`
- `/starters/vue-base/package.json` - Remove `"lint": "eslint . --ext .js,.jsx --fix"`
- `/starters/vue-typescript/package.json` - Remove `"lint": "oxlint"`
- `/starters/vue-kitchensink/package.json` - No lint script (no action needed)

**Examples - React** (7 files):
- `/examples/react-vanilla/package.json` - Remove `"lint": "oxlint"`
- `/examples/react-vanilla-spa/package.json` - Remove `"lint": "oxlint"`
- `/examples/react-vanilla-spa-ts/package.json` - Remove `"lint": "oxlint"`
- `/examples/react-vanilla-ts/package.json` - Remove `"lint": "oxlint"`
- `/examples/react-hydration/package.json` - Remove `"lint": "oxlint --fix"`
- `/examples/react-next-mini/package.json` - Remove `"lint": "oxlint --fix"`
- `/examples/react-streaming/package.json` - Remove `"lint": "oxlint --fix"`

**Examples - Vue** (7 files):
- `/examples/vue-vanilla/package.json` - Remove `"lint": "oxlint"`
- `/examples/vue-vanilla-spa/package.json` - Remove `"lint": "oxlint"`
- `/examples/vue-vanilla-ts/package.json` - Remove `"lint": "oxlint"`
- `/examples/vue-vanilla-spa-ts/package.json` - Remove `"lint": "oxlint"`
- `/examples/vue-hydration/package.json` - Remove `"lint": "eslint . --ext .js,.vue --fix"`
- `/examples/vue-next-mini/package.json` - Remove `"lint": "eslint . --ext .js,.vue --fix"`
- `/examples/vue-streaming/package.json` - Remove `"lint": "eslint . --ext .js,.vue --fix"`

**Contrib** (7 files):
- `/contrib/htmx-base/package.json` - Remove `"lint": "eslint . --ext .js,.jsx --fix"`
- `/contrib/htmx-base-ts/package.json` - Remove `"lint": "eslint . --ext .js,.jsx --fix"`
- `/contrib/htmx-kitchensink/package.json` - Remove `"lint": "eslint . --ext .js,.jsx --fix"`
- `/contrib/solid-vanilla/package.json` - Remove `"lint": "eslint . --ext .js,.jsx --fix"`
- `/contrib/solid-hydration/package.json` - Remove `"lint": "eslint . --ext .js,.jsx --fix"`
- `/contrib/svelte-vanilla/package.json` - Remove `"lint": "eslint . --ext .js,.svelte --fix"`
- `/contrib/svelte-hydration/package.json` - Remove `"lint": "eslint . --ext .js,.svelte --fix"`

---

### Phase 4: Remove ESLint Configuration Files

**Delete the following ESLint config files** (10 files):

1. `/packages/fastify-vite/.eslintrc.json`
2. `/packages/fastify-vue/.eslintrc`
3. `/starters/vue-base/.eslintrc`
4. `/starters/vue-kitchensink/.eslintrc`
5. `/examples/vue-vanilla/.eslintrc.yml`
6. `/examples/vue-hydration/.eslintrc.yml`
7. `/examples/vue-next-mini/.eslintrc.yml`
8. `/examples/vue-vanilla-spa/.eslintrc.yml`
9. `/examples/vue-streaming/.eslintrc.yml`
10. `/contrib/svelte-vanilla/.eslintrc.yml`
11. `/contrib/svelte-hydration/.eslintrc.yml`
12. `/contrib/solid-vanilla/.eslintrc.yml`
13. `/contrib/solid-hydration/.eslintrc.yml`
14. `/contrib/htmx-base/.eslintrc` (if exists)
15. `/contrib/htmx-base-ts/.eslintrc` (if exists)
16. `/contrib/htmx-kitchensink/.eslintrc` (if exists)

---

### Phase 5: Remove Biome Configuration Files

**Current State**: You currently have 3 individual Biome config files that need to be deleted.

**Delete individual Biome config files** (3 files):

1. `/packages/fastify-vite/biome.json`
2. `/packages/fastify-react/biome.json`
3. `/packages/fastify-htmx/biome.json`

These are no longer needed - oxfmt handles formatting for the entire monorepo.

---

### Phase 6: Remove Linter Dependencies

#### 6.1 Remove Biome from Individual Packages

**Current State**: You currently have Biome installed in 3 core packages (fastify-vite, fastify-react, fastify-htmx). These need to be removed since we're using oxfmt at the root.

**Remove `@biomejs/biome` from devDependencies** (3 files):

- `/packages/fastify-vite/package.json` - Remove `"@biomejs/biome": "^1.9.4"`
- `/packages/fastify-react/package.json` - Remove `"@biomejs/biome": "^1.9.2"`
- `/packages/fastify-htmx/package.json` - Remove `"@biomejs/biome": "^1.9.x"`

#### 6.2 Remove ESLint Dependencies (If Present)

Check and remove ESLint-related dependencies from package.json files in:
- `/starters/vue-base/package.json`
- `/starters/vue-kitchensink/package.json`
- `/examples/vue-*` packages
- `/contrib/*` packages

**Typical ESLint dependencies to remove**:
```json
"eslint": "^8.x.x",
"eslint-plugin-react": "^7.x.x",
"eslint-plugin-vue": "^9.x.x",
"eslint-plugin-svelte": "^2.x.x",
"@typescript-eslint/parser": "^6.x.x",
"@typescript-eslint/eslint-plugin": "^6.x.x"
```

---

## Installation & Cleanup Commands

### Step 1: Update Root Dependencies

```bash
# From repository root
pnpm add -D oxlint@^1.36.0 oxfmt@^0.21.0
```

### Step 2: Clean Individual Package Dependencies

```bash
# Remove oxlint from all packages
pnpm -r exec pnpm remove oxlint

# Remove Biome from the 3 packages that have it
cd packages/fastify-vite && pnpm remove @biomejs/biome
cd ../fastify-react && pnpm remove @biomejs/biome
cd ../fastify-htmx && pnpm remove @biomejs/biome
cd ../../..

# Remove ESLint from packages (do for each package with ESLint)
pnpm -r exec pnpm remove eslint eslint-plugin-react eslint-plugin-vue eslint-plugin-svelte @typescript-eslint/parser @typescript-eslint/eslint-plugin 2>/dev/null || true
```

### Step 3: Clean Lock File and Reinstall

```bash
# Clean install to update pnpm-lock.yaml
pnpm install
```

### Step 4: Verify Installation

```bash
# Check oxlint version
pnpm oxlint --version
# Should output: oxlint version 1.36.0

# Check oxfmt version
pnpm oxfmt --version
# Should output: oxfmt 0.21.0
```

---

## Testing the Migration

### Step 1: Test Linting

```bash
# Run lint check (should check all files in monorepo)
pnpm lint

# Run lint with auto-fix
pnpm lint:fix
```

### Step 2: Test Formatting

```bash
# Check formatting
pnpm format:check

# Apply formatting
pnpm format

# Should format all supported files (.js, .jsx, .ts, .tsx, .vue, .css, .json, etc.)
```

### Step 3: Test on Specific Package Types

```bash
# Test React files
pnpm lint packages/fastify-react/

# Test Vue files
pnpm lint packages/fastify-vue/

# Test TypeScript files
pnpm lint packages/fastify-vite/

# Test example projects
pnpm lint examples/react-vanilla/
pnpm lint examples/vue-vanilla/
```

---

## CI/CD Updates

### Current State: NO LINTING IN CI! ⚠️

Your `.github/workflows/ci.yml` currently only runs tests, not linting. You need to add linting and formatting checks.

### Update `.github/workflows/ci.yml`

**Add these steps after "Install dependencies" and before "Run tests":**

```yaml
- name: Install dependencies
  run: pnpm install --ignore-scripts

# ADD THESE NEW STEPS:
- name: Lint code
  run: pnpm lint

- name: Check formatting
  run: pnpm format:check

- name: Run tests
  shell: 'script --return --quiet --command "bash {0}"'
  run: pnpm test
```

**Complete updated ci.yml** (lines 41-46):
```yaml
      - name: Install dependencies
        run: pnpm install --ignore-scripts

      - name: Lint code
        run: pnpm lint

      - name: Check formatting
        run: pnpm format:check

      - name: Run tests
        shell: 'script --return --quiet --command "bash {0}"'
        run: pnpm test
```

This ensures:
- ✅ All PRs are linted before merge
- ✅ Code formatting is consistent
- ✅ CI fails fast if linting errors exist (before running slower tests)

---

## Rollback Plan

If issues arise during migration:

### Quick Rollback:

```bash
# Restore from git
git checkout package.json pnpm-workspace.yaml
git clean -fd  # Remove new config files

# Reinstall old dependencies
pnpm install
```

### Partial Rollback:

Keep oxlint at root but restore individual package linters:
1. Don't remove individual lint scripts
2. Keep old config files
3. Use both root `pnpm lint` and package-specific linting in parallel

---

## Expected Benefits

### Performance
- **50-100x faster linting** compared to ESLint
- Parallel processing across CPU cores
- Near-instant feedback during development

### Maintenance
- **Single configuration file** (`/oxlintrc.json`)
- **Single version** to manage (no version conflicts)
- **Consistent rules** across all packages
- **Easier onboarding** for new contributors

### Developer Experience
- Faster pre-commit hooks
- Faster CI/CD pipelines
- Unified linting commands
- Better IDE integration with oxlint extensions

---

## Known Limitations & Considerations

### 1. Vue/Svelte Template Linting

**Current Limitation**: Oxlint only lints `<script>` sections in `.vue` and `.svelte` files, not template syntax.

**Impact**: Template-specific rules like `vue/no-unused-components` won't be enforced.

**JavaScript Plugin System**: Oxlint has a JS plugin system (technical preview) that supports ESLint plugins, BUT it explicitly does NOT support Vue/Svelte template parsing yet. The Oxc team is "implementing the remaining features over the next few months" according to their [JS Plugins documentation](https://oxc.rs/docs/guide/usage/linter/js-plugins.html).

**Mitigation Options for Now**:
1. **Accept this limitation** (recommended) - Most critical issues are in `<script>` sections
2. **Keep ESLint in specific packages** - Only for Vue/Svelte packages that need template linting
3. **Use language servers** - Vue/Svelte language servers provide template validation in IDEs
4. **Wait for JS plugin support** - Coming in the next few months, then you can use `eslint-plugin-vue` via oxlint

**Future Path**: Once JS plugins support custom parsers, you'll be able to configure `.oxlintrc.json` like:
```json
{
  "jsPlugins": ["eslint-plugin-vue"],
  "rules": {
    "vue/no-unused-components": "error"
  }
}
```

### 2. Framework-Specific Rules

**Check**: Verify oxlint has all the React/Vue/Svelte rules you currently use.

**Action**: Review current ESLint configs and compare with oxlint's available rules.

### 3. Custom ESLint Plugins

**Limitation**: Oxlint doesn't support custom ESLint plugins.

**Impact**: If you use custom internal ESLint plugins, they won't work with oxlint.

**Mitigation**: Port important custom rules to oxlintrc.json or abandon if not critical.

### 4. Gradual Migration Alternative

If full migration is too risky, consider:

**Hybrid Approach**:
- Use oxlint at root for common files
- Keep ESLint in specific packages (Vue, Svelte, Solid)
- Gradually migrate package by package

---

## File Change Summary

### Files to Create (0-3):
- `/oxlintrc.json` (OPTIONAL - only if you want to customize rules)
- `/oxfmt.config.json` (OPTIONAL - oxfmt works well without config)
- `/.vscode/extensions.json` (OPTIONAL - recommends Oxc extension to developers)

**Config files needed**: Possibly ZERO! But VSCode setup is recommended for better DX.

### Files to Modify (45):
- `/package.json` ✏️
- `/pnpm-workspace.yaml` ✏️
- `/.github/workflows/ci.yml` ✏️ (ADD linting steps!)
- `/.vscode/settings.json` ✏️ (Configure Oxc extension!)
- 41 package.json files (remove lint scripts, remove dependencies)

### Files to Delete (16+):
- 10+ ESLint config files (.eslintrc, .eslintrc.yml, .eslintrc.json)
- 3 Biome config files (biome.json in packages/fastify-vite, fastify-react, fastify-htmx)

### Total Changes: ~63 files (plus optional extensions.json)

---

## Migration Checklist

### Pre-Migration
- [ ] Backup current codebase (`git commit -am "Pre-oxlint migration checkpoint"`)
- [ ] Document current linting rules in use
- [ ] Review current ESLint errors/warnings baseline
- [ ] Communicate migration plan to team

### Phase 1: Root Setup
- [ ] Update `/package.json` (oxlint + oxfmt dependencies, scripts)
- [ ] Update `/pnpm-workspace.yaml` (remove oxlint from catalog)
- [ ] Update `/.vscode/settings.json` (configure Oxc extension)
- [ ] Create `/.vscode/extensions.json` (optional - recommend extension)
- [ ] ~~Create `/oxlintrc.json`~~ (SKIP - use defaults!)
- [ ] ~~Create `/oxfmt.config.json`~~ (SKIP - use defaults!)
- [ ] Run `pnpm install`
- [ ] Test `pnpm lint` and `pnpm format` at root

### Phase 2: Remove Individual Package Oxlint
- [ ] Remove oxlint from 4 starters
- [ ] Remove oxlint from 7 React examples
- [ ] Remove oxlint from 3 Vue examples
- [ ] Run `pnpm install` to update lock file

### Phase 3: Remove Lint Scripts
- [ ] Remove lint scripts from 4 core packages
- [ ] Remove lint scripts from 6 starters
- [ ] Remove lint scripts from 14 examples
- [ ] Remove lint scripts from 7 contrib packages

### Phase 4: Remove ESLint Configs
- [ ] Delete 10+ .eslintrc* files
- [ ] Remove ESLint dependencies from affected packages
- [ ] Run `pnpm install` to update lock file

### Phase 5: Remove Biome Configs
- [ ] Delete 3 biome.json files from packages
- [ ] Remove @biomejs/biome from 3 package.json files
- [ ] Run `pnpm install` to update lock file

### Phase 6: Testing
- [ ] Run `pnpm lint` - should complete successfully
- [ ] Run `pnpm lint:fix` - should auto-fix issues
- [ ] Run `pnpm format` - should format all files
- [ ] Test on sample React files
- [ ] Test on sample Vue files
- [ ] Test on sample TypeScript files
- [ ] Review and fix any new linting errors

### Phase 7: Documentation & CI
- [ ] **UPDATE `.github/workflows/ci.yml`** - ADD lint and format:check steps
- [ ] **Notify team** to install Oxc VSCode extension
- [ ] Update CONTRIBUTING.md with new linting instructions (if exists)
- [ ] Update pre-commit hooks if applicable
- [ ] Document any oxlint-specific conventions

### Post-Migration
- [ ] Run full test suite (`pnpm test`)
- [ ] Create migration summary commit
- [ ] **Ensure all developers install Oxc extension** for real-time feedback
- [ ] Monitor for any issues in first week
- [ ] Gather team feedback

---

## Timeline Estimate

- **Phase 1-2**: 30 minutes (root setup + dependency removal)
- **Phase 3-5**: 45 minutes (remove scripts, configs, cleanup)
- **Phase 6**: 30 minutes (testing and fixing issues)
- **Phase 7**: 15 minutes (documentation updates)

**Total**: ~2-3 hours

---

## Support & Resources

- **Oxlint Documentation**: https://oxc.rs/docs/guide/usage/linter.html
- **Oxlint Rules**: https://oxc.rs/docs/guide/usage/linter/rules.html
- **oxfmt Documentation**: https://oxc.rs/docs/guide/usage/formatter.html
- **JavaScript Plugins**: https://oxc.rs/docs/guide/usage/linter/js-plugins.html (technical preview)
- **Oxc VSCode Extension**: https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode
- **VSCode Extension Docs**: https://oxc.rs/docs/contribute/vscode
- **Oxc Project**: https://oxc.rs
- **GitHub Issues**: Report issues at https://github.com/oxc-project/oxc/issues

---

## Conclusion

This migration will significantly improve linting and formatting performance while reducing maintenance overhead by:
- Updating from severely outdated oxlint versions (0.9.10/0.16.6) to latest (1.36.0)
- Adding blazing-fast oxfmt (v0.21.0) for formatting
- Consolidating 3 different linters into a single unified Oxc toolchain
- Removing 61+ config/dependency files
- Providing 50-100x faster linting + 30x faster formatting
- **ZERO configuration required** - oxlint/oxfmt work perfectly with defaults
- **Single root installation** - Automatically handles React, Vue, Svelte, Solid files
- Unified ecosystem with consistent updates and configuration

The migration is low-risk with a clear rollback plan and can be completed in a single session.

## TL;DR: Simplest Possible Migration

1. Install: `pnpm add -D oxlint@^1.36.0 oxfmt@^0.21.0`
2. Update root package.json scripts
3. Remove oxlint from pnpm-workspace.yaml catalog
4. Update .vscode/settings.json to use Oxc extension
5. Remove all individual package lint scripts and dependencies
6. Add linting to CI workflow
7. Run `pnpm lint` and `pnpm format` from root
8. **Done!** No config files needed (except VSCode setup).

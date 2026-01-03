import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'

const rootDir = join(import.meta.dirname, '..', '..', '..')
const pkgDir = join(import.meta.dirname, '..')

// Read pnpm-workspace.yaml
const workspaceYaml = readFileSync(join(rootDir, 'pnpm-workspace.yaml'), 'utf-8')
const workspace = parse(workspaceYaml) as {
  catalog: Record<string, string>
  catalogs: Record<string, Record<string, string>>
}

// Read @fastify/vite version from its package.json
const fastifyVitePkg = JSON.parse(
  readFileSync(join(rootDir, 'packages', 'fastify-vite', 'package.json'), 'utf-8')
)

// Build the versions object
const versions: Record<string, string> = {
  '@fastify/vite': `^${fastifyVitePkg.version}`,
  fastify: workspace.catalog.fastify,
  vite: workspace.catalog.vite,
  react: workspace.catalogs.react.react,
  'react-dom': workspace.catalogs.react['react-dom'],
  '@vitejs/plugin-react': workspace.catalogs.react['@vitejs/plugin-react'],
}

// Generate the versions.json file
const versionsPath = join(pkgDir, 'src', 'versions.json')
writeFileSync(versionsPath, JSON.stringify(versions, null, 2) + '\n')
console.log('Generated src/versions.json with versions:', versions)

// Copy template files from examples/react-vanilla-spa to templates/react-spa
const SKIP_PATTERNS = ['node_modules', 'dist', '.test.js', '.test.ts']

function shouldSkip(name: string): boolean {
  return SKIP_PATTERNS.some((pattern) => name.includes(pattern))
}

function copyTemplate(src: string, dest: string): void {
  const entries = readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    if (shouldSkip(entry.name)) continue

    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true })
      copyTemplate(srcPath, destPath)
    } else {
      cpSync(srcPath, destPath)
    }
  }
}

const templateSrc = join(rootDir, 'examples', 'react-vanilla-spa')
const templateDest = join(pkgDir, 'templates', 'react-spa')

// Clean and recreate templates directory
if (existsSync(join(pkgDir, 'templates'))) {
  rmSync(join(pkgDir, 'templates'), { recursive: true })
}
mkdirSync(templateDest, { recursive: true })

copyTemplate(templateSrc, templateDest)
console.log('Copied template files to templates/react-spa')

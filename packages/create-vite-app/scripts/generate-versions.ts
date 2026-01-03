import { readFileSync, writeFileSync } from 'node:fs'
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
  readFileSync(join(rootDir, 'packages', 'fastify-vite', 'package.json'), 'utf-8'),
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

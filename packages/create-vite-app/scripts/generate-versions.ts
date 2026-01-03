import { join } from 'node:path'
import { fs, YAML } from 'zx'

const rootDir = join(import.meta.dirname, '..', '..', '..')
const pkgDir = join(import.meta.dirname, '..')

const workspaceYaml = fs.readFileSync(join(rootDir, 'pnpm-workspace.yaml'), 'utf-8')
const workspace = YAML.parse(workspaceYaml) as {
  catalog: Record<string, string>
  catalogs: Record<string, Record<string, string>>
}

const fastifyVitePkg = fs.readJsonSync(join(rootDir, 'packages', 'fastify-vite', 'package.json'))

const versions: Record<string, string> = {
  '@fastify/vite': `^${fastifyVitePkg.version}`,
  fastify: workspace.catalog.fastify,
  vite: workspace.catalog.vite,
  react: workspace.catalogs.react.react,
  'react-dom': workspace.catalogs.react['react-dom'],
  '@vitejs/plugin-react': workspace.catalogs.react['@vitejs/plugin-react'],
}

const versionsPath = join(pkgDir, 'src', 'versions.json')
fs.writeJsonSync(versionsPath, versions, { spaces: 2 })
console.log('Generated src/versions.json with versions:', versions)

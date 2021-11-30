
import { fileURLToPath } from 'url'

$.quote = s => s

const { entries } = Object

let root = fileURLToPath(path.dirname(import.meta.url))
let [example, renderer, exRoot, deps] = await parseArgv(root)

let pkgInfos = {}

await cd(root)

await $`rm -rf ${exRoot}/node_modules/vite`
await $`rm -rf ${exRoot}/node_modules/.vite`

await $`mv ${root}/${exRoot}/package.json ${root}/${exRoot}/package.dist.json`
await $`mv ${root}/${exRoot}/package.dev.json ${root}/${exRoot}/package.json`

for (let pkg of ['fastify-vite', renderer]) {
  await $`rm -rf ${exRoot}/node_modules/${pkg}`
  let pkgRoot = `${root}/packages/${pkg}`
  let pkgInfo = await readJSON(`${pkgRoot}/package.json`)
  pkgInfos[pkg] = pkgInfo
  const subDeps = entries(pkgInfo.dependencies).map(([n, v]) => `${n}@${v}`)
  await cd(`${root}/${exRoot}`)
  await $`npm install --silent --force ${deps.external.join(' ')} ${subDeps.join(' ')}`
  await cd(root)
}

await $`mv ${root}/${exRoot}/package.json ${root}/${exRoot}/package.dev.json`
await $`mv ${root}/${exRoot}/package.dist.json ${root}/${exRoot}/package.json`

// Hard copy packages after all calls to npm install have ended
// If you run npm install on the example folder, you also need to run devinstall again
for (let pkg of ['fastify-vite', renderer]) {
  await $`cp -r ${root}/packages/${pkg} ${root}/${exRoot}/node_modules/${pkg}`
}

async function getDeps (example, exRoot) {
  const examplePackage = await readJSON(`${root}/${exRoot}/package.json`)
  const pkgInfo = await fs.readdir(path.join(root, 'packages'))
  return {
    local: Object.keys(examplePackage.dependencies).filter(dep => pkgInfo.includes(dep)),
    external: Object.keys(examplePackage.dependencies).filter(dep => !pkgInfo.includes(dep))
  }
}

async function parseArgv () {
  const example = process.argv[3]
  const renderer = process.argv[4]
  const exRoot = `examples/${example}`
  const deps = await getDeps(path.join(exRoot, 'package.json'), exRoot)
  if (!example || !renderer) {
    console.error('Usage: npm run devinstall -- <dir>')
    process.exit(1)
  }
  if (!await fs.stat(path.join(root, exRoot)).catch(() => false)) {
    console.error(`Directory ${join(root, exRoot)} does not exist.`)
    process.exit(1)    
  }
  return [example, renderer, exRoot, deps]
}

async function readJSON(path) {
  const json = await fs.readFile(path, 'utf8')
  return JSON.parse(json)
}

async function writeJSON(path, contents) {
  await fs.writeFile(path, contents)
}

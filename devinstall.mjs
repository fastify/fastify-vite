import { readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { dirname } from 'desm'

$.quote = s => s

const { entries } = Object

let root = dirname(import.meta.url)
let [example, exRoot, deps] = await parseArgv(root)

let pkgInfos = {}

await cd(root)

await $`rm -rf ${exRoot}/node_modules/vite`
await $`rm -rf ${exRoot}/node_modules/.vite`

for (let pkg of deps.local) {
  await $`rm -rf ${exRoot}/node_modules/${pkg}`
  let pkgRoot = `${root}/packages/${pkg}`
  let pkgInfo = await readJSON(`${pkgRoot}/package.json`)
  pkgInfos[pkg] = pkgInfo
  const subDeps = entries(pkgInfo.dependencies).map(([n, v]) => `${n}@${v}`)
  await cd(`${root}/${exRoot}`)
  await $`npm install --silent --force ${deps.external} ${subDeps.join(' ')}`
  await cd(root)
}

// Hard copy packages after all calls to npm install have ended
// If you run npm install on the example folder, you also need to run devinstall again
for (let pkg of deps.local) {
  await $`rm -r ${root}/${exRoot}/node_modules/${pkg}`
  await $`cp -r ${root}/packages/${pkg} ${root}/${exRoot}/node_modules/${pkg}`
  await $`cp ${root}/${exRoot}/package.dist.json ${root}/${exRoot}/package.json`
}

async function getDeps (example, exRoot) {
  const examplePackage = await readJSON(`${root}/${exRoot}/package.dist.json`)
  const pkgInfo = readdirSync(join(root, 'packages'))
  return {
    local: Object.keys(examplePackage.dependencies).filter(dep => pkgInfo.includes(dep)),
    external: Object.keys(examplePackage.dependencies).filter(dep => !pkgInfo.includes(dep))
  }
}

async function parseArgv () {
  const example = process.argv[3]
  const exRoot = `examples/${example}`
  const deps = await getDeps(join(exRoot, 'package.dist.json'), exRoot)
  if (!example) {
    console.error('Usage: npm run devinstall -- <dir>')
    process.exit(1)
  }
  if (!existsSync(join(root, exRoot))) {
    console.error(`Directory ${join(root, exRoot)} does not exist.`)
    process.exit(1)    
  }
  return [example, exRoot, deps]
}

async function readJSON(path) {
  const json = await fs.readFile(path, 'utf8')
  return JSON.parse(json)
}

async function writeJSON(path, contents) {
  await fs.writeFile(path, contents)
}

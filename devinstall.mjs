import { dirname } from 'desm'

$.quote = s => s

const { entries } = Object

let examples = {
  vue: ['fastify-vite', 'fastify-vite-vue'],
  react: ['fastify-vite', 'fastify-vite-react'],
}

let root = dirname(import.meta.url)
let [example, pkgs] = parseArgv(root)

let exRoot = `examples/${example}`
let pkgInfos = {}

await cd(root)
await $`rm -rf ${exRoot}/node_modules/vite`
await $`rm -rf ${exRoot}/node_modules/.vite`

for (let pkg of pkgs) {
  await $`rm -rf ${exRoot}/node_modules/${pkg}`
  let pkgRoot = `${root}/packages/${pkg}`
  let pkgInfo = await readJSON(`${pkgRoot}/package.json`)
  pkgInfos[pkg] = pkgInfo
  let deps = entries(pkgInfo.dependencies).map(([n, v]) => `${n}@${v}`)
  await cd(`${root}/${exRoot}`)
  await $`npm install --silent --force ${deps.join(' ')}`
  await cd(root)
}

// Hard copy packages after all calls to npm install have ended
// If you run npm install on the example folder, you also need to run devinstall again
for (let pkg of pkgs) {
  await $`cp -r ${root}/packages/${pkg} ${root}/${exRoot}/node_modules/${pkg}`
  let examplePackage = await readJSON(`${root}/${exRoot}/package.json`)
  examplePackage.dependencies[pkg] = `^${pkgInfos[pkg].version}`
  await writeJSON(`${root}/${exRoot}/package.json`, JSON.stringify(examplePackage, null, 2))
}

function parseArgv () {
  const key = process.argv[3]
  if (!examples[key]) {
    console.error('Usage: npm run devinstall -- <dir>')
    process.exit(1)
  }
  return [key, examples[key]]
}

async function readJSON(path) {
  const json = await fs.readFile(path, 'utf8')
  return JSON.parse(json)
}

async function writeJSON(path, contents) {
  await fs.writeFile(path, contents)
}

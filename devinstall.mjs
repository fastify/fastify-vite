
$.quote = s => s

const { entries } = Object

let examples = {
  vue: ['fastify-vite', 'fastify-vite-vue'],
  // react: ['fastify-vite', 'fastify-vite-react'],
}

let root = (await $`pwd`).stdout.trim()

for (let [example, pkgs] of entries(examples)) {
  let exRoot = `examples/${example}`
  let pkgInfos = {}
  for (let pkg of pkgs) {
    await $`rm -rf ${exRoot}/node_modules/${pkg}`
    let pkgRoot = `packages/${pkg}`
    let pkgInfo = await readJSON(`${pkgRoot}/package.json`)
    pkgInfos[pkg] = pkgInfo
    let deps = entries(pkgInfo.dependencies).map(([n, v]) => `${n}@${v}`)
    await cd(exRoot)
    await $`npm install --silent --force ${deps.join(' ')}`
    await cd(root)
  }
  // Hard copy packages after all calls to npm install have ended
  // If you run npm install on the example folder, you also need to run devinstall again
  for (let pkg of pkgs) {
    await $`cp -r packages/${pkg} ${exRoot}/node_modules/${pkg}`
    let examplePackage = await readJSON(`${exRoot}/package.json`)
    examplePackage.dependencies[pkg] = `^${pkgInfos[pkg].version}`
    await writeJSON(`${exRoot}/package.json`, JSON.stringify(examplePackage, null, 2))
  }
}

async function readJSON(path) {
  const json = await fs.readFile(path, 'utf8')
  return JSON.parse(json)
}

async function writeJSON(path, contents) {
  await fs.writeFile(path, contents)
}

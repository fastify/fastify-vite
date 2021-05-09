
$.quote = s => s

const {entries} = Object

let examples = {
  vue: ['fastify-vite', 'fastify-vite-vue'],
  react: ['fastify-vite', 'fastify-vite-react'],
}

let root = (await $`pwd`).stdout.trim()

for (let [example, pkgs] of entries(examples)) {
  let exRoot = `examples/${example}`
  await $`rm -rf ${exRoot}/node_modules`
  await $`mkdir -p ${exRoot}/node_modules`
  for (let pkg of pkgs) {
    await $`rm -rf ${exRoot}/node_modules/${pkg}`
    await $`cp -r packages/${pkg} ${exRoot}/node_modules/${pkg}`
    let pkgRoot = `packages/${pkg}`
    let pkgInfo = await readJSON(`${pkgRoot}/package.json`)
    let deps = entries(pkgInfo.dependencies).map(([n, v]) => `${n}@${v}`)
    await cd(exRoot)
    await $`npm install --silent --force ${deps.join(' ')}`
    await cd(root)
  }
}

async function readJSON(path) {
  const json = await fs.readFile(path, 'utf8')
  return JSON.parse(json)
}

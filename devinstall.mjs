
const root = path.resolve(__dirname)
const { name: example } = path.parse(process.cwd())
const exRoot = path.resolve(__dirname, 'examples', example)

if (!fs.existsSync(exRoot)) {
  console.log('Must be called from a directory under examples/.')
  process.exit()
}

await $`rm -rf ${exRoot}/node_modules/vite`
await $`rm -rf ${exRoot}/node_modules/.vite`

const deps = require(path.join(exRoot, 'package.deps.json'))
const localPackages = fs.readdirSync(path.join(root, 'packages'))

const externalDeps = Object.fromEntries(Object.entries(deps).filter(([dep]) => {
  return !localPackages.includes(dep)
}))

const devDeps = Object.fromEntries(Object.entries(deps).filter(([dep]) => {
  return localPackages.includes(dep)
}))

for (const devDep of Object.keys(devDeps)) {
  for (const [dep, version] of Object.entries(
    require(path.join(root, 'packages', devDep, 'package.json')).dependencies)
  ) {
    externalDeps[dep] = version
  }
}

await updateDeps(exRoot, externalDeps)
await $`npm install -f`

for (const devDep of Object.keys(devDeps)) {
  await $`cp -r ${root}/packages/${devDep} ${exRoot}/node_modules/${devDep}`
}

async function updateDeps(exRoot, dependencies) {
  await fs.writeFile(
    path.join(exRoot, 'package.json'),
    JSON.stringify({
      ...require(path.join(exRoot, 'package.json')),
      dependencies,
    }, null, 2)
  )
}

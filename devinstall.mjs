
import chokidar from 'chokidar'
const root = path.resolve(__dirname)
const { name: example } = path.parse(process.cwd())
const exRoot = path.resolve(__dirname, 'examples', example)

if (!fs.existsSync(exRoot)) {
  console.log('Must be called from a directory under examples/.')
  process.exit()
}

await $`rm -rf ${exRoot}/node_modules/vite`
await $`rm -rf ${exRoot}/node_modules/.vite`

const template = require(path.join(exRoot, 'package.json'))
const localPackages = fs.readdirSync(path.join(root, 'packages'))

const { external, local } = template
const dependencies = { ...external, ...local }

for (const localDep of Object.keys(local)) {
  for (const [dep, version] of Object.entries(
    require(path.join(root, 'packages', localDep, 'package.json')).dependencies)
  ) {
    dependencies[dep] = version
  }
}

await createPackageFile(exRoot, dependencies)
await $`npm install -f`

const watchers = []

for (const localDep of Object.keys(local)) {
  await $`cp -r ${root}/packages/${localDep} ${exRoot}/node_modules/${localDep}`
  setImmediate(() => {
    const watcher = chokidar.watch(`${root}/packages/${localDep}`, {
      ignored: [/node_modules/],
      ignoreInitial: true,
    })
    const changed = () => $`cp -r ${root}/packages/${localDep} ${exRoot}/node_modules/${localDep}`
    watcher.on('add', changed)
    watcher.on('unlink', changed)
    watcher.on('change', changed)
    watchers.push(changed)
  })
}

async function createPackageFile(exRoot, dependencies) {
  await fs.writeFile(
    path.join(exRoot, 'package.json'),
    JSON.stringify({ ...template, dependencies }, null, 2)
  )
}

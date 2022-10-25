
/* globals $,path,fs */
/* eslint-disable node/no-path-concat */

const vitestConf = await fs.readFile(path.join(__dirname, `vitest.config.js`), 'utf8')

if (process.argv.includes('--cleanup')) {
  await $`rm -rf packages/fastify-vite/node_modules`
  const examples = await fs.readdir('examples')
  for (const example of examples) {
    if (example.match(/\.DS_Store/)) {
      continue
    }
    cd(path.join(__dirname, `examples/${example}`))
    const pkg = await require(path.join(__dirname, `examples/${example}/package.json`))
    pkg.scripts['dependencies'] = {
      ...pkg.devInstall.local,
      ...pkg.devInstall.external
    }
    delete pkg.scripts['dependencies']
    pkg.dependencies['@fastify/vite'] = '^3.0.0'
    await fs.writeFile(path.join(__dirname, `examples/${example}/package.json`), JSON.stringify(pkg, null, 2))
    // await fs.writeFile(path.join(__dirname, `examples/${example}/vitest.config.js`), vitestConf)
    // $.verbose = true
    // await $`npm run test`
  }
  // cd('../../packages/fastify-vite')
  // await $`npm install`
  process.exit()
}

if (process.argv.includes('--all')) {
  await $`rm -rf packages/fastify-vite/node_modules`
  const examples = await fs.readdir('examples')
  for (const example of examples) {
    if (example.match(/\.DS_Store/)) {
      continue
    }
    cd(path.join(__dirname, `examples/${example}`))
    console.log(`Preparing ./examples/${example}`)
    $.verbose = false
    await $`npm run devinstall`
    const pkg = await require(path.join(__dirname, `examples/${example}/package.json`))
    pkg.scripts['test'] = 'vitest run'
    await fs.writeFile(path.join(__dirname, `examples/${example}/package.json`), JSON.stringify(pkg, null, 2))
    await fs.writeFile(path.join(__dirname, `examples/${example}/vitest.config.js`), vitestConf)
    $.verbose = true
    await $`npm run test`
  }
  cd('../../packages/fastify-vite')
  await $`npm install`
  process.exit()
}

const { name: example } = path.parse(process.cwd())
const exRoot = path.resolve(__dirname, 'examples', example)
const command = process.argv.slice(5)

if (!fs.existsSync(exRoot)) {
  console.log('Must be called from a directory under examples/.')
  process.exit()
}

await $`rm -rf ${exRoot}/node_modules/vite`
await $`rm -rf ${exRoot}/node_modules/.vite`

const template = require(path.join(exRoot, 'package.json'))

const { external, local } = template.devInstall
const dependencies = { ...external }

for (const localDep of Object.keys(local)) {
  for (const [dep, version] of Object.entries(
    require(path.join(__dirname, 'packages', localDep, 'package.json')).dependencies || [])
  ) {
    if (!Object.keys(local).includes(dep)) {
      dependencies[dep] = version
    }
  }
}

await createPackageFile(exRoot, dependencies)
await $`npm install -f`

for (const localDep of Object.keys(local)) {
  await $`rm -rf ${exRoot}/node_modules/${localDep}`
  await $`cp -r ${__dirname}/packages/${localDep} ${exRoot}/node_modules/${localDep}`
  if (localDep === 'fastify-dx') {
    await $`ln -s ${exRoot}/node_modules/${localDep}/index.mjs ${exRoot}/node_modules/.bin/dx`
  }
}

// try {
//   await $`${command}`
// } finally {
//   setImmediate(() => process.exit(0))
// }

async function createPackageFile (exRoot, dependencies) {
  const { type, scripts, devDependencies, devInstall } = template
  await fs.writeFile(
    path.join(exRoot, 'package.json'),
    JSON.stringify({ type, scripts, dependencies, devDependencies, devInstall }, null, 2),
  )
}

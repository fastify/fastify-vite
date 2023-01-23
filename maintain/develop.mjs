
$.verbose = false

await $`rm -rf packages/fastify-vite/node_modules`

const root = path.resolve(__dirname, '..')
const examplesPath = path.join(root, 'examples')

const examples = await fs.readdir(examplesPath)
const templates = {
  react: require(path.join(root, 'maintain', 'examples', 'react.json')),
  // vue: require(path.join(root, 'maintain', 'examples', 'vue.json')),
  // svelte: require(path.join(root, 'maintain', 'examples', 'svelte.json')),
  // solid: require(path.join(root, 'maintain', 'examples', 'solid.json')),
}

for (const example of examples) {
  if (process.argv[2] && !example.match(process.argv[2])) {
    continue
  }
  const examplePath = path.join(__dirname, example)

  if (!fs.statSync(examplePath).isDirectory()) {
    continue
  }

  const family = example.split('-')[0]
  const { local, type, scripts, dependencies, devDependencies } = templates[family]

  await setupDevDependencies(examplePath)

  cd(examplePath)

  await $`npm install`

  for (const [localDep, localDepPath] of Object.entries(local)) {
    const pkgInfo = path.join(root, 'packages', localDepPath, 'package.json')
    await $`rm -rf ${exRoot}/node_modules/${localDep}`
    await $`cp -r ${__dirname}/packages/${localDepMap[localDep]} ${exRoot}/node_modules/${localDep}`
  }
}

cd('../../packages/fastify-vite')

await $`npm install`

function setupDevDependencies (example) {
  const examplePath = path.join('examples', example)

  
  for (const [localDep, localDepPath] of Object.entries(local)) {
    const pkgInfo = path.join(root, 'packages', localDepPath, 'package.json')
    for (const [dep, version] of Object.entries(pkgInfo.dependencies ?? [])) {
      if (!Object.keys(local).includes(dep)) {
        dependencies[dep] = version
      }
    }
}

}

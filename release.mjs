import { readFile, writeFile } from 'fs/promises'
import { dirname } from 'path'
import semver from 'semver'

const releaseType = process.argv[3]
const currentRelease = JSON.parse(await fs.readFile('packages/fastify-vite/package.json')).version
const newVersion = semver.inc(currentRelease, releaseType)

for (const examplePackage of await globby('examples/*/package.json')) {
  const pkgInfo = JSON.parse(await readFile(examplePackage, 'utf8'))
  for (const [dep, version] of Object.entries(pkgInfo.dependencies)) {
    if (dep.includes('fastify-vite')) {
      pkgInfo.dependencies[dep] = `^${newVersion}`
    }
  }
  await writeFile(examplePackage, JSON.stringify(pkgInfo, null, 2))
}

for (const rendererPackage of await globby('packages/fastify-vite*/package.json')) {
  const pkgInfo = JSON.parse(await readFile(rendererPackage, 'utf8'))
  pkgInfo.version = newVersion
  await writeFile(rendererPackage, JSON.stringify(pkgInfo, null, 2))
  await $`npm publish ./${dirname(rendererPackage)}`
}

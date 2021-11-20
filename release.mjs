import { readFile, writeFile } from 'fs/promises'
import semver from 'semver'

const releaseType = process.argv[3]
const currentRelease = JSON.parse(await fs.readFile('packages/fastify-vite/package.json')).version
const version = semver.inc(currentRelease, releaseType)

for (const examplePackage of await globby('examples/*/package.json')) {
  const pkgInfo = JSON.parse(await readFile(examplePackage, 'utf8'))
  await writeFile(examplePackage, JSON.stringify({ ...pkgInfo, version }, null, 2))
}

for (const rendererPackage of await globby('packages/fastify-vite-*/package.json')) {
  const pkgInfo = JSON.parse(await readFile(rendererPackage, 'utf8'))
  await writeFile(rendererPackage, JSON.stringify({ ...pkgInfo, version }, null, 2))
}


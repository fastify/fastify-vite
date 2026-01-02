$.verbose = true

import { join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'

const root = import.meta.dirname

const fastifyViteVersion = getVersion('fastify-vite')
const fastifyVueVersion = getVersion('fastify-vue')
const fastifyReactVersion = getVersion('fastify-react')

const starters = [
  'react-base',
  'react-kitchensink',
  'react-typescript',
  'vue-base',
  'vue-kitchensink',
  'vue-typescript',
]

if (process.argv.includes('--prep-for-dev')) {
  await prepForDev()
}

if (process.argv.includes('--prep-for-release')) {
  await prepForRelease()
}

async function prepForRelease() {
  const starterRoot = join(root, 'starters')
  cd(starterRoot)
  // Remove optionalDependencies from @fastify/vite's package.json
  let mainPkgJSONPath = join(root, 'packages', 'fastify-vite', 'package.json')
  let pkgJSON = JSON.parse(readFileSync(mainPkgJSONPath))
  delete pkgJSON.optionalDependencies
  writeFileSync(mainPkgJSONPath, JSON.stringify(pkgJSON, null, 2))
  // Replace workspace:^ with hard versions referenced in starter package.json files
  for (const starter of starters) {
    pkgJSON = JSON.parse(readFileSync(join(starterRoot, starter, 'package.json')))
    pkgJSON.dependencies['@fastify/vite'] = `^${fastifyViteVersion}`
    if (pkgJSON.dependencies['@fastify/vue']) {
      pkgJSON.dependencies['@fastify/vue'] = `^${fastifyVueVersion}`
    }
    if (pkgJSON.dependencies['@fastify/react']) {
      pkgJSON.dependencies['@fastify/react'] = `^${fastifyReactVersion}`
    }
    writeFileSync(join(starterRoot, starter, 'package.json'), JSON.stringify(pkgJSON, null, 2))
  }
  cd(root)
  await $`pnpm i`
  await $`pnpm format`
  process.exit()
}

async function prepForDev() {
  const starterRoot = join(root, 'starters')
  cd(starterRoot)
  for (const starter of starters) {
    const pkgJSON = JSON.parse(readFileSync(join(starterRoot, starter, 'package.json')))
    pkgJSON.dependencies['@fastify/vite'] = 'workspace:^'
    if (pkgJSON.dependencies['@fastify/vue']) {
      pkgJSON.dependencies['@fastify/vue'] = 'workspace:^'
    }
    if (pkgJSON.dependencies['@fastify/react']) {
      pkgJSON.dependencies['@fastify/react'] = 'workspace:^'
    }
    writeFileSync(join(starterRoot, starter, 'package.json'), JSON.stringify(pkgJSON, null, 2))
  }
  cd(root)
  await $`pnpm i`
  await $`pnpm format`
  process.exit()
}

function getVersion(pkg) {
  const pkgJSON = JSON.parse(readFileSync(join(root, 'packages', pkg, 'package.json')))
  return pkgJSON.version
}

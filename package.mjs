$.verbose = true

import { join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import { setTimeout as wait } from 'node:timers/promises'

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

if (process.argv.includes('--wait-for-published-packages')) {
  await waitForPublishedPackages()
}

async function waitForPublishedPackages() {
  const publishedPackages = JSON.parse(process.env.PUBLISHED_PACKAGES || '[]')
  const attempts = 12
  const delayMs = 10_000

  for (const pkg of publishedPackages) {
    let found = false
    const spec = `${pkg.name}@${pkg.version}`

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const { stdout } = await $`pnpm view ${spec} version`
        if (stdout.trim() === pkg.version) {
          console.log(`${spec} is available on npm.`)
          found = true
          break
        }
      } catch {
        console.log(`${spec} is not available on npm yet; retrying (${attempt}/${attempts}).`)
      }

      if (attempt < attempts) {
        await wait(delayMs)
      }
    }

    if (!found) {
      throw new Error(`${spec} did not become available on npm.`)
    }
  }

  process.exit()
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
  await $`pnpm install --no-frozen-lockfile`
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
  await $`pnpm install --no-frozen-lockfile`
  await $`pnpm format`
  process.exit()
}

function getVersion(pkg) {
  const pkgJSON = JSON.parse(readFileSync(join(root, 'packages', pkg, 'package.json')))
  return pkgJSON.version
}

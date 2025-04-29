
$.verbose = true

import { join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'

const root = path.resolve(__dirname)

if (process.argv.includes('--test')) {
  cd(join(root, 'packages/fastify-vite'))

  await $`npx vitest run`
  await $`sleep 1`

  if (process.stdout.isTTY) {
    for (const example of [
      'react-vanilla',
      'react-vanilla-spa',
      'react-vanilla-ts',
      'react-hydration',
      'react-next-mini',
      'react-streaming',
      'vue-vanilla',
      'vue-vanilla-spa',
      'vue-vanilla-ts',
      'vue-hydration',
      'vue-next-mini',
      'vue-streaming',
    ]) {
      cd(join(root, 'examples', example))
      await $`node --test`
    }
  }
  process.exit()
}

const fastifyViteVersion = getVersion('fastify-vite')
const fastifyVueVersion = getVersion('fastify-vue')
const fastifyReactVersion = getVersion('fastify-react')

if (process.argv.includes('--prep-for-dev')) {
  const starterRoot = join(root, 'starters')

  cd(starterRoot)

  if (process.stdout.isTTY) {
    for (const starter of [
      'react-base',
      'react-kitchensink',
      // 'react-typescript',
      'vue-base',
      'vue-kitchensink',
      // 'vue-typescript',
    ]) {
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
  }
  process.exit()
}

if (process.argv.includes('--prep-for-release')) {
  const starterRoot = join(root, 'starters')

  cd(starterRoot)

  if (process.stdout.isTTY) {
    for (const starter of [
      'react-base',
      'react-kitchensink',
      // 'react-typescript',
      'vue-base',
      'vue-kitchensink',
      // 'vue-typescript',
    ]) {
      const pkgJSON = JSON.parse(readFileSync(join(starterRoot, starter, 'package.json')))
      pkgJSON.dependencies['@fastify/vite'] = fastifyViteVersion
      if (pkgJSON.dependencies['@fastify/vue']) {
        pkgJSON.dependencies['@fastify/vue'] = fastifyVueVersion
      }
      if (pkgJSON.dependencies['@fastify/react']) {
        pkgJSON.dependencies['@fastify/react'] = fastifyReactVersion
      }
      writeFileSync(join(starterRoot, starter, 'package.json'), JSON.stringify(pkgJSON, null, 2))
    }
  }
  process.exit()
}

function getVersion (pkg) {
  const pkgJSON = JSON.parse(
    readFileSync(join(root, 'packages', pkg, 'package.json'))
  )
  return pkgJSON.version
}

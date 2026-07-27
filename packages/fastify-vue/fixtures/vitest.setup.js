import { execSync } from 'node:child_process'
import { join } from 'node:path'

export default async function setup() {
  // Build @fastify/vue (tsc -> dist/) so `@fastify/vue/plugin` resolves in the fixture's vite config
  execSync('pnpm build', {
    cwd: join(import.meta.dirname, '..'),
    stdio: 'inherit',
  })
  // Build the fixture app
  execSync('pnpm build', {
    cwd: join(import.meta.dirname, 'basic'),
    stdio: 'inherit',
  })
}

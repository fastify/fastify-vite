import { execSync } from 'node:child_process'
import { join } from 'node:path'

export default async function setup() {
  execSync('pnpm build', { cwd: join(import.meta.dirname, 'cjs'), stdio: 'inherit' })
  execSync('pnpm build', { cwd: join(import.meta.dirname, 'esm'), stdio: 'inherit' })
}

import { execSync } from 'node:child_process'
import { join } from 'node:path'

export default async function setup() {
  execSync('pnpm build', { cwd: join(import.meta.dirname, 'basic'), stdio: 'inherit' })
}

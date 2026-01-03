#!/usr/bin/env node

import { join } from 'node:path'
import * as p from '@clack/prompts'
import { $, fs } from 'zx'
import versions from './versions.json' with { type: 'json' }

const TEMPLATE_DIR = join(import.meta.dirname, '..', 'templates', 'react-spa')

function transformPackageJson(projectName: string, destDir: string): void {
  const pkgPath = join(destDir, 'package.json')
  const pkg = fs.readJsonSync(pkgPath)

  pkg.name = projectName

  for (const depType of ['dependencies', 'devDependencies'] as const) {
    if (!pkg[depType]) continue
    for (const [name, version] of Object.entries(pkg[depType])) {
      if (
        typeof version === 'string' &&
        (version.startsWith('workspace:') || version.startsWith('catalog:'))
      ) {
        const resolved = versions[name as keyof typeof versions]
        if (resolved) {
          pkg[depType][name] = resolved
        }
      }
    }
  }

  delete pkg.private

  fs.writeJsonSync(pkgPath, pkg, { spaces: 2 })
}

function detectPackageManager(): 'pnpm' | 'yarn' | 'bun' | 'npm' {
  const userAgent = process.env.npm_config_user_agent
  if (userAgent) {
    if (userAgent.includes('pnpm')) return 'pnpm'
    if (userAgent.includes('yarn')) return 'yarn'
    if (userAgent.includes('bun')) return 'bun'
  }
  return 'npm'
}

async function main(): Promise<void> {
  p.intro('Create Fastify + Vite App')

  let projectName = process.argv[2]

  if (!projectName) {
    const result = await p.text({
      message: 'Project name:',
      placeholder: 'my-fastify-app',
      defaultValue: 'my-fastify-app',
      validate: (value) => {
        if (!value) return 'Project name is required'
        if (fs.existsSync(value)) return `Directory "${value}" already exists`
      },
    })

    if (p.isCancel(result)) {
      p.cancel('Operation cancelled')
      process.exit(0)
    }

    projectName = result
  }

  const destDir = join(process.cwd(), projectName)

  if (fs.existsSync(destDir)) {
    p.cancel(`Directory "${projectName}" already exists`)
    process.exit(1)
  }

  const copySpinner = p.spinner()
  copySpinner.start('Copying template files...')

  try {
    await fs.copy(TEMPLATE_DIR, destDir, {
      filter: (src) => !src.includes('node_modules') && !src.includes('.test.'),
    })
    transformPackageJson(projectName, destDir)
    copySpinner.stop('Template files copied')
  } catch (error) {
    copySpinner.stop('Failed to copy template')
    throw error
  }

  const pm = detectPackageManager()
  const installSpinner = p.spinner()
  installSpinner.start(`Installing dependencies with ${pm}...`)

  try {
    $.cwd = destDir
    $.quiet = true
    await $`${pm} install`
    installSpinner.stop('Dependencies installed')
  } catch {
    installSpinner.stop(`Failed to install dependencies. Run "${pm} install" manually.`)
  }

  p.outro(`Done! To get started:

  cd ${projectName}
  ${pm} run dev`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

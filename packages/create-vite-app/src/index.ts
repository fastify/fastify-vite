#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import * as p from '@clack/prompts'
import versions from './versions.json' with { type: 'json' }

const TEMPLATE_DIR = join(import.meta.dirname, '..', 'templates', 'react-spa')

const SKIP_PATTERNS = ['node_modules', 'dist', '.test.js', '.test.ts']

function shouldSkip(name: string): boolean {
  return SKIP_PATTERNS.some((pattern) => name.includes(pattern))
}

function copyTemplate(src: string, dest: string): void {
  const entries = readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    if (shouldSkip(entry.name)) continue

    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true })
      copyTemplate(srcPath, destPath)
    } else {
      cpSync(srcPath, destPath)
    }
  }
}

function transformPackageJson(projectName: string, destDir: string): void {
  const pkgPath = join(destDir, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

  // Update name
  pkg.name = projectName

  // Replace workspace: and catalog: references with actual versions
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

  // Remove private flag for user projects
  delete pkg.private

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

function detectPackageManager(): 'pnpm' | 'yarn' | 'bun' | 'npm' {
  // Check npm_config_user_agent (set when running via package manager)
  const userAgent = process.env.npm_config_user_agent
  if (userAgent) {
    if (userAgent.includes('pnpm')) return 'pnpm'
    if (userAgent.includes('yarn')) return 'yarn'
    if (userAgent.includes('bun')) return 'bun'
  }
  return 'npm'
}

async function installDependencies(pm: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(pm, ['install'], {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${pm} install failed with code ${code}`))
    })
    child.on('error', reject)
  })
}

async function main(): Promise<void> {
  p.intro('Create Fastify + Vite App')

  // Get project name from CLI arg or prompt
  let projectName = process.argv[2]

  if (!projectName) {
    const result = await p.text({
      message: 'Project name:',
      placeholder: 'my-fastify-app',
      defaultValue: 'my-fastify-app',
      validate: (value) => {
        if (!value) return 'Project name is required'
        if (existsSync(value)) return `Directory "${value}" already exists`
      },
    })

    if (p.isCancel(result)) {
      p.cancel('Operation cancelled')
      process.exit(0)
    }

    projectName = result
  }

  const destDir = join(process.cwd(), projectName)

  // Check if directory already exists
  if (existsSync(destDir)) {
    p.cancel(`Directory "${projectName}" already exists`)
    process.exit(1)
  }

  // Copy template
  const copySpinner = p.spinner()
  copySpinner.start('Copying template files...')

  try {
    mkdirSync(destDir, { recursive: true })
    copyTemplate(TEMPLATE_DIR, destDir)
    transformPackageJson(projectName, destDir)
    copySpinner.stop('Template files copied')
  } catch (error) {
    copySpinner.stop('Failed to copy template')
    throw error
  }

  // Install dependencies
  const pm = detectPackageManager()
  const installSpinner = p.spinner()
  installSpinner.start(`Installing dependencies with ${pm}...`)

  try {
    await installDependencies(pm, destDir)
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

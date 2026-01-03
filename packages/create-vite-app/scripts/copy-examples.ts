import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const rootDir = join(import.meta.dirname, '..', '..', '..')
const pkgDir = join(import.meta.dirname, '..')

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

const templateSrc = join(rootDir, 'examples', 'react-vanilla-spa')
const templateDest = join(pkgDir, 'templates', 'react-spa')

// Clean and recreate templates directory
if (existsSync(join(pkgDir, 'templates'))) {
  rmSync(join(pkgDir, 'templates'), { recursive: true })
}
mkdirSync(templateDest, { recursive: true })

copyTemplate(templateSrc, templateDest)
console.log('Copied template files to templates/react-spa')

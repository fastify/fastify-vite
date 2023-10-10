import { existsSync, promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import isInstalledGlobally from 'is-installed-globally'
import globalDirs from 'global-dirs'
import resolve from 'resolve'
import { ensurePrefix, slash, uniq } from '@antfu/utils'

const require = createRequire(import.meta.url)
const { 
  createServer: createSlidevServer,
  resolveOptions: resolveSlidevOptions
} = require('@slidev/cli')

export const resolveOptions = resolveSlidevOptions
export const createServer = createSlidevServer

// Taken from slidev/packages/slidev/node/utils.ts
export function resolveImportPath (importName, ensure = false) {
  try {
    return resolve.sync(importName, { preserveSymlinks: false })
  }
  catch {}

  if (isInstalledGlobally) {
    try {
      return require.resolve(join(globalDirs.yarn.packages, importName))
    }
    catch {}

    try {
      return require.resolve(join(globalDirs.npm.packages, importName))
    }
    catch {}
  }

  if (ensure)
    throw new Error(`Failed to resolve package "${importName}"`)

  return undefined
}

// Taken from slidev/packages/slidev/node/common.ts
export async function getIndexHtml({ clientRoot, themeRoots, addonRoots, data, userRoot }) {
  let main = await fs.readFile(join(clientRoot, 'index.html'), 'utf-8')
  let head = ''
  let body = ''

  head += `<link rel="icon" href="${data.config.favicon}">`

  const roots = uniq([
    ...themeRoots,
    ...addonRoots,
    userRoot,
  ])

  for (const root of roots) {
    const path = join(root, 'index.html')
    if (!existsSync(path))
      continue

    const index = await fs.readFile(path, 'utf-8')

    head += `\n${(index.match(/<head>([\s\S]*?)<\/head>/im)?.[1] || '').trim()}`
    body += `\n${(index.match(/<body>([\s\S]*?)<\/body>/im)?.[1] || '').trim()}`
  }

  if (data.features.tweet)
    body += '\n<script async src="https://platform.twitter.com/widgets.js"></script>'

  if (data.config.fonts.webfonts.length && data.config.fonts.provider !== 'none')
    head += `\n<link rel="stylesheet" href="${generateGoogleFontsUrl(data.config.fonts)}" type="text/css">`

  main = main
    .replace('__ENTRY__', toAtFS(join(clientRoot, 'main.ts')))
    .replace('<!-- head -->', head)
    .replace('<!-- body -->', body)

  return main
}

// Taken from slidev/packages/slidev/node/utils.ts
function generateGoogleFontsUrl (options) {
  const weights = options.weights
    .flatMap(i => options.italic ? [`0,${i}`, `1,${i}`] : [`${i}`])
    .sort()
    .join(';')
  const fonts = options.webfonts
    .map(i => `family=${i.replace(/^(['"])(.*)\1$/, '$1').replace(/\s+/g, '+')}:${options.italic ? 'ital,' : ''}wght@${weights}`)
    .join('&')

  return `https://fonts.googleapis.com/css2?${fonts}&display=swap`
}

// Taken from slidev/packages/slidev/node/utils.ts
function toAtFS(path) {
  return `/@fs${ensurePrefix('/', slash(path))}`
}

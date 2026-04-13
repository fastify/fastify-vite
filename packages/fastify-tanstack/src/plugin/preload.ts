import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, isAbsolute, parse as parsePath } from 'node:path'

const imageFileRE = /\.((png)|(jpg)|(svg)|(webp)|(gif))$/

interface BundleChunk {
  type: 'chunk'
  isDynamicEntry?: boolean
  name: string
  fileName: string
  imports?: string[]
  moduleIds: string[]
  modules: Record<string, { originalLength: number }>
  viteMetadata?: {
    importedCss?: string[]
  }
}

function isDynamicChunk(meta: unknown): meta is BundleChunk {
  return (
    typeof meta === 'object' &&
    meta !== null &&
    (meta as Record<string, unknown>).type === 'chunk' &&
    !!(meta as Record<string, unknown>).isDynamicEntry
  )
}

export async function closeBundle(
  this: {
    environment: {
      name: string
      config: {
        build: { assetsInlineLimit: number | Function; outDir: string }
        root: string
        base: string
      }
    }
  },
  resolvedBundle: Record<string, unknown> | null,
) {
  if (this.environment.name !== 'client') {
    return
  }
  const { assetsInlineLimit } = this.environment.config.build
  const { root, base } = this.environment.config
  let distDir: string
  if (isAbsolute(this.environment.config.build.outDir)) {
    distDir = this.environment.config.build.outDir
  } else {
    distDir = join(root, this.environment.config.build.outDir)
  }

  const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf8')

  const routeChunks = Object.values(resolvedBundle ?? {}).filter(isDynamicChunk)

  if (routeChunks.length === 0) {
    return
  }

  const limit = typeof assetsInlineLimit === 'number' ? assetsInlineLimit : 0

  for (const chunk of routeChunks) {
    const jsImports = chunk.imports ?? []
    const cssImports = chunk.viteMetadata?.importedCss ?? []
    const images = chunk.moduleIds.filter((img) => {
      return chunk.modules[img].originalLength > limit && imageFileRE.test(img)
    })

    let imagePreloads = '\n'
    for (let image of images) {
      image = image.slice(root.length + 1)
      imagePreloads += `  <link rel="preload" as="image" crossorigin href="${base}${image}">\n`
    }
    let cssPreloads = ''
    for (const css of cssImports) {
      cssPreloads += `  <link rel="preload" as="style" crossorigin href="${base}${css}">\n`
    }
    let jsPreloads = ''
    for (const js of jsImports) {
      jsPreloads += `  <link rel="modulepreload" crossorigin href="${base}${js}">\n`
    }

    const pageHtml = appendHead(indexHtml, imagePreloads, cssPreloads, jsPreloads)
    const htmlPath = `html/${chunk.name}.html`
    writeHtml(htmlPath, pageHtml, distDir)
  }
}

function appendHead(html: string, ...tags: string[]) {
  const content = tags.join('\n  ')
  return html.replace(/<head([^>]*)>/i, `<head$1>\n  ${content}`)
}

function writeHtml(htmlPath: string, pageHtml: string, distDir: string) {
  const { dir, base } = parsePath(htmlPath)
  const htmlDir = join(distDir, dir)
  if (!existsSync(htmlDir)) {
    mkdirSync(htmlDir, { recursive: true })
  }
  writeFileSync(join(htmlDir, base), pageHtml)
}

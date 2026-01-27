import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, isAbsolute, parse as parsePath } from 'node:path'

const imageFileRE = /\.((png)|(jpg)|(svg)|(webp)|(gif))$/

export async function closeBundle(resolvedBundle) {
  if (this.environment.name !== 'client') {
    return
  }
  const { assetsInlineLimit } = this.environment.config.build
  const { root, base } = this.environment.config
  let distDir
  if (isAbsolute(this.environment.config.build.outDir)) {
    distDir = this.environment.config.build.outDir
  } else {
    distDir = join(root, this.environment.config.build.outDir)
  }
  const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf8')
  const pages = Object.fromEntries(
    Object.entries(resolvedBundle ?? {}).filter(([, meta]) => {
      if (meta.facadeModuleId?.includes('/pages/')) {
        meta.htmlPath = meta.facadeModuleId.replace(/.*pages\/(.*)\.(j|t)sx$/, 'html/$1.html')
        return true
      }
    }),
  )
  for (const page of Object.values(pages)) {
    const jsImports = page.imports
    const cssImports = page.viteMetadata.importedCss
    const images = page.moduleIds.filter((img) => {
      return page.modules[img].originalLength > assetsInlineLimit && imageFileRE.test(img)
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
    writeHtml(page, pageHtml, distDir)
  }
}

function appendHead(html, ...tags) {
  const content = tags.join('\n  ')
  return html.replace(/<head([^>]*)>/i, `<head$1>\n  ${content}`)
}

function writeHtml(page, pageHtml, distDir) {
  const { dir, base } = parsePath(page.htmlPath)
  const htmlDir = join(distDir, dir)
  if (!existsSync(htmlDir)) {
    mkdirSync(htmlDir, { recursive: true })
  }
  writeFileSync(join(htmlDir, base), pageHtml)
}

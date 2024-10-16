import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, parse as parsePath } from 'node:path'
import { HTMLRewriter } from 'html-rewriter-wasm'

const imageFile = /\.((png)|(jpg)|(svg)|(webp)|(gif))$/

export async function closeBundle() {
  if (!this.resolvedConfig.build.ssr) {
    const distDir = join(this.root, this.resolvedConfig.build.outDir)
    const pages = Object.fromEntries(
      Object.entries(this.resolvedBundle ?? {})
        .filter(([id, meta]) => {
          if (meta.facadeModuleId?.includes('/pages/')) {
            meta.htmlPath = meta.facadeModuleId.replace(/.*pages\/(.*)\.vue$/, 'html/$1.html')
            return true
          }
        })
    )
    for (const page of Object.values(pages)) {
      const jsImports = page.imports
      const cssImports = page.viteMetadata.importedCss
      const images = page.moduleIds.filter(_ => imageFile.test(_))
      let imagePreloads = '\n'
      for (let image of images) {
        image = image.slice(this.root.length + 1)
        imagePreloads += `  <link rel="preload" as="image" href="${this.resolvedConfig.base}${image}">\n`
      }
      let cssPreloads = ''
      for (const css of cssImports) {
        cssPreloads += `  <link rel="preload" as="style" href="${this.resolvedConfig.base}${css}">\n`
      }
      let jsPreloads = ''
      for (const js of jsImports) {
        jsPreloads += `  <link rel="modulepreload" href="${this.resolvedConfig.base}${js}">\n`
      }
      const pageHtml = await appendHead(
        this.indexHtml, 
        imagePreloads, 
        cssPreloads, 
        jsPreloads
      )
      writeHtml(page, pageHtml, distDir)
    }
  }
}

async function appendHead (html, ...tags) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let output = ''
  const rewriter = new HTMLRewriter((outputChunk) => {
    output += decoder.decode(outputChunk)
  })
  rewriter.on('head', {
    element(element) {
      element.prepend(tags.join('\n  '), { html: true })
    },
  })
  try {
    await rewriter.write(encoder.encode(html))
    await rewriter.end()
    return output
  } finally {
    rewriter.free()
  }
}

function writeHtml(page, pageHtml, distDir) {
  const { dir, base } = parsePath(page.htmlPath)
  const htmlDir = join(distDir, dir)
  if (!existsSync(htmlDir)) {
    mkdirSync(htmlDir, { recursive: true })
  }
  writeFileSync(join(htmlDir, base), pageHtml)
}

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, isAbsolute, parse as parsePath } from 'node:path'
import type { Rollup } from 'vite'

const imageFileRE = /\.((png)|(jpg)|(svg)|(webp)|(gif))$/

type PageChunk = Rollup.OutputChunk & {
  viteMetadata?: { importedCss: Set<string> | string[] }
  htmlPath?: string
}

export interface CloseBundleEnv {
  name: string
  root: string
  base: string
  outDir: string
  assetsInlineLimit: number | ((filePath: string, content: Buffer) => boolean | undefined)
}

export async function closeBundle(
  env: CloseBundleEnv,
  resolvedBundle: Rollup.OutputBundle | undefined,
): Promise<void> {
  if (env.name !== 'client') {
    return
  }
  // If the build failed before generateBundle, transformIndexHtml never ran with
  // a bundle and resolvedBundle is undefined. Skip so the original build error
  // surfaces instead of being masked by an ENOENT on the missing index.html.
  if (!resolvedBundle) {
    return
  }
  const { root, base } = env
  // When `assetsInlineLimit` is a function, treat as "never inline by size"
  // so per-image size never triggers a preload entry (matches pre-TS behavior
  // where `number > function` collapsed to NaN > X => false).
  const assetsInlineLimit =
    typeof env.assetsInlineLimit === 'function' ? Infinity : env.assetsInlineLimit
  const distDir = isAbsolute(env.outDir) ? env.outDir : join(root, env.outDir)
  const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf8')
  const pages = Object.fromEntries(
    Object.entries(resolvedBundle ?? {}).filter((entry): entry is [string, PageChunk] => {
      const [, meta] = entry
      if (meta.type !== 'chunk') {
        return false
      }
      if (meta.facadeModuleId?.includes('/pages/')) {
        ;(meta as PageChunk).htmlPath = meta.facadeModuleId.replace(
          /.*pages\/(.*)\.vue$/,
          'html/$1.html',
        )
        return true
      }
      return false
    }),
  ) as Record<string, PageChunk & { htmlPath: string }>
  for (const page of Object.values(pages)) {
    const jsImports = page.imports
    const cssImports = page.viteMetadata?.importedCss ?? []
    const images = page.moduleIds.filter((img) => {
      return page.modules[img]?.renderedLength > assetsInlineLimit && imageFileRE.test(img)
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

function appendHead(html: string, ...tags: string[]): string {
  const content = tags.join('\n  ')
  return html.replace(/<head([^>]*)>/i, `<head$1>\n  ${content}`)
}

function writeHtml(
  page: { htmlPath: string },
  pageHtml: string,
  distDir: string,
): void {
  const { dir, base } = parsePath(page.htmlPath)
  const htmlDir = join(distDir, dir)
  if (!existsSync(htmlDir)) {
    mkdirSync(htmlDir, { recursive: true })
  }
  writeFileSync(join(htmlDir, base), pageHtml)
}

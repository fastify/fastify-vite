import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

import { resolveIfRelative } from '../ioutils.ts'
import { getApplicationRootDir } from './paths.ts'
import { transformAssetUrls } from '../html-assets.ts'
import type { Bundle, BundleConfig } from '../types/bundle.ts'

export async function resolveSSRBundle({
  isDevMode,
  viteConfig,
  root,
  baseAssetUrl,
}: BundleConfig): Promise<Bundle | undefined> {
  const bundle: Bundle = {}
  let clientOutDir: string

  if (!isDevMode) {
    if (viteConfig.fastify) {
      clientOutDir = resolveIfRelative(
        viteConfig.fastify.outDirs?.client || '',
        await getApplicationRootDir(root),
      )
    } else {
      bundle.dir = resolveIfRelative(viteConfig.build.outDir, viteConfig.root)
      clientOutDir = join(bundle.dir, 'client')
    }

    const indexHtmlPath = join(clientOutDir, 'index.html')
    if (!existsSync(indexHtmlPath)) {
      return
    }
    let indexHtml = await readFile(indexHtmlPath, 'utf8')
    if (baseAssetUrl) {
      indexHtml = await transformAssetUrls(indexHtml, viteConfig.base || '/', baseAssetUrl)
    }
    bundle.indexHtml = indexHtml
    const manifestPaths = [
      join(clientOutDir, 'ssr-manifest.json'),
      join(clientOutDir, '.vite/ssr-manifest.json'),
      join(clientOutDir, '.vite/manifest.json'),
    ]
    for (const manifestPath of manifestPaths) {
      if (existsSync(manifestPath)) {
        const manifestData = await readFile(manifestPath, 'utf8')
        bundle.manifest = JSON.parse(manifestData)
      }
    }
  } else {
    bundle.manifest = {}
  }
  return bundle
}

export async function resolveSPABundle({
  isDevMode,
  viteConfig,
  root,
  baseAssetUrl,
}: BundleConfig): Promise<Bundle | undefined> {
  const bundle: Bundle = {}
  if (!isDevMode) {
    let clientOutDir: string

    if (viteConfig.fastify) {
      clientOutDir = resolveIfRelative(
        viteConfig.fastify.outDirs?.client || '',
        await getApplicationRootDir(root),
      )
    } else {
      bundle.dir = resolveIfRelative(viteConfig.build.outDir, viteConfig.root)
      clientOutDir = join(bundle.dir, 'client')
    }

    const indexHtmlPath = join(clientOutDir, 'index.html')
    if (!existsSync(indexHtmlPath)) {
      return
    }
    let indexHtml = await readFile(indexHtmlPath, 'utf8')
    if (baseAssetUrl) {
      indexHtml = await transformAssetUrls(indexHtml, viteConfig.base || '/', baseAssetUrl)
    }
    bundle.indexHtml = indexHtml
  } else {
    bundle.manifest = {}
  }
  return bundle
}

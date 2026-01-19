import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

import { resolveIfRelative } from '../ioutils.ts'
import { getApplicationRootDir } from './paths.ts'
import type { Bundle, BundleConfig } from './types.ts'

export async function resolveSSRBundle({
  dev,
  vite,
  root,
}: BundleConfig): Promise<Bundle | undefined> {
  const bundle: Bundle = {}
  let clientOutDir: string

  if (!dev) {
    if (vite.fastify) {
      clientOutDir = resolveIfRelative(
        vite.fastify.outDirs?.client || '',
        await getApplicationRootDir(root),
      )
    } else {
      bundle.dir = resolveIfRelative(vite.build.outDir, vite.root)
      clientOutDir = join(bundle.dir, 'client')
    }

    const indexHtmlPath = join(clientOutDir, 'index.html')
    if (!existsSync(indexHtmlPath)) {
      return
    }
    bundle.indexHtml = await readFile(indexHtmlPath, 'utf8')
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
    bundle.manifest = []
  }
  return bundle
}

export async function resolveSPABundle({
  dev,
  vite,
  root,
}: BundleConfig): Promise<Bundle | undefined> {
  const bundle: Bundle = {}
  if (!dev) {
    let clientOutDir: string

    if (vite.fastify) {
      clientOutDir = resolveIfRelative(
        vite.fastify.outDirs?.client || '',
        await getApplicationRootDir(root),
      )
    } else {
      bundle.dir = resolveIfRelative(vite.build.outDir, vite.root)
      clientOutDir = join(bundle.dir, 'client')
    }

    const indexHtmlPath = join(clientOutDir, 'index.html')
    if (!existsSync(indexHtmlPath)) {
      return
    }
    bundle.indexHtml = await readFile(indexHtmlPath, 'utf8')
  } else {
    bundle.manifest = []
  }
  return bundle
}

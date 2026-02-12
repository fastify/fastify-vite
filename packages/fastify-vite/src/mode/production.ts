import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, parse, resolve } from 'node:path'
import type { FastifyInstance } from 'fastify'
import FastifyStatic from '@fastify/static'
import type { ClientEntries, ClientModule } from '../types/client.ts'
import type { ProdRuntimeConfig } from '../types/options.ts'
import type { SerializableViteConfig } from '../types/vite-configs.ts'
import { resolveIfRelative } from '../ioutils.ts'
import { transformAssetUrls } from '../html-assets.ts'
import type { FastifyViteDecorationPriorToSetup } from './support.ts'

type EntryBundle =
  | {
      default?: unknown
    }
  | Record<string, unknown>

function fileUrl(str: string): string {
  if (typeof str !== 'string') {
    throw new Error('Expected a string')
  }

  let pathName = resolve(str).replace(/\\/g, '/')

  if (pathName[0] !== '/') {
    pathName = `/${pathName}`
  }

  return encodeURI(`file://${pathName}`)
}

async function loadBundle(
  distOutDir: string,
  entryPath: string,
  rootDir: string,
  config: ProdRuntimeConfig,
): Promise<EntryBundle> {
  const parsedNamed = parse(entryPath).name
  const bundleFiles = [`${parsedNamed}.js`, `${parsedNamed}.mjs`]

  const fixWin32Path =
    process.platform === 'win32'
      ? (filePath: string) => new URL(fileUrl(filePath))
      : (filePath: string) => filePath

  let getBundlePath: (serverFile: string) => string | URL
  if (isAbsolute(distOutDir)) {
    getBundlePath = (serverFile: string) => fixWin32Path(resolve(distOutDir, serverFile))
  } else {
    const { packageDirectory } = await import('package-directory')
    const pkgDir = await packageDirectory({ cwd: rootDir })
    getBundlePath = (serverFile: string) => fixWin32Path(resolve(pkgDir, distOutDir, serverFile))
  }

  let bundlePath: string | URL

  for (const serverFile of bundleFiles) {
    bundlePath = getBundlePath(serverFile)
    if (existsSync(bundlePath)) {
      break
    }
  }
  let bundle = await import(bundlePath as string)
  if (typeof bundle.default === 'function') {
    bundle = await bundle.default(config)
  }
  return bundle.default || bundle
}

async function loadEntries(
  config: ProdRuntimeConfig,
  viteConfig: SerializableViteConfig,
): Promise<ClientEntries> {
  if (config.spa) {
    return {}
  }

  const entries: ClientEntries = {}
  if (viteConfig.fastify?.entryPaths) {
    for (const [env, entryPath] of Object.entries(viteConfig.fastify.entryPaths)) {
      const bundle = await loadBundle(
        viteConfig.fastify.outDirs![env]!,
        entryPath,
        config.root,
        config,
      )
      if (bundle) {
        entries[env] = bundle as unknown as ClientModule
      }
    }
  }
  return entries
}

export async function setup(
  fastifyViteDecoration: FastifyViteDecorationPriorToSetup,
): Promise<ClientModule | undefined> {
  const runtimeConfig = fastifyViteDecoration.runtimeConfig as ProdRuntimeConfig
  const { spa, viteConfig } = runtimeConfig
  let clientOutDir: string
  let ssrOutDir: string
  let assetsDir: string

  if (viteConfig.fastify?.outDirs) {
    const { outDirs } = viteConfig.fastify

    const { packageDirectory } = await import('package-directory')
    const outDirRoot = await packageDirectory({ cwd: runtimeConfig.root })

    clientOutDir = resolveIfRelative(outDirs.client!, outDirRoot)
    ssrOutDir = resolveIfRelative(outDirs.ssr || '', outDirRoot)
    assetsDir = viteConfig.build.assetsDir
  } else {
    const outDir = resolveIfRelative(viteConfig.build!.outDir!, viteConfig.root!)

    clientOutDir = resolve(outDir, 'client')
    ssrOutDir = resolve(outDir, 'server')
    assetsDir = viteConfig.build!.assetsDir!
  }

  if (!existsSync(clientOutDir)) {
    throw new Error(`No client distribution bundle found at ${clientOutDir}.`)
  }

  if (!spa && !existsSync(ssrOutDir)) {
    throw new Error(`No SSR distribution bundle found at ${ssrOutDir}.`)
  }

  const registrationPrefix = runtimeConfig.prefix || ''
  const basePathname = URL.canParse(viteConfig.base ?? '')
    ? new URL(viteConfig.base!).pathname
    : viteConfig.base || '/'
  await fastifyViteDecoration.scope.register(async function assetFiles(scope: FastifyInstance) {
    const root = [resolve(clientOutDir, assetsDir)]
    if (existsSync(resolve(ssrOutDir, assetsDir))) {
      root.push(resolve(ssrOutDir, assetsDir))
    }
    await scope.register(FastifyStatic, {
      ...runtimeConfig.fastifyStaticOptions,
      root,
      prefix: join(registrationPrefix, basePathname, assetsDir).replace(/\\/g, '/'),
    })
  })

  await fastifyViteDecoration.scope.register(async function publicFiles(scope: FastifyInstance) {
    await scope.register(FastifyStatic, {
      ...runtimeConfig.fastifyStaticOptions,
      root: clientOutDir,
      prefix: join(registrationPrefix, basePathname).replace(/\\/g, '/'),
      index: false,
      wildcard: false,
      allowedPath(path: string) {
        return path !== '/index.html'
      },
    })
  })

  Object.defineProperty(runtimeConfig, 'hasRenderFunction', {
    writable: false,
    value: typeof runtimeConfig.createRenderFunction === 'function',
  })

  const entries = await loadEntries(runtimeConfig, viteConfig)

  const client: ClientModule | undefined = !runtimeConfig.spa
    ? await runtimeConfig.prepareClient(entries, fastifyViteDecoration.scope, runtimeConfig)
    : undefined

  const indexHtmlPath = join(clientOutDir, 'index.html')
  let indexHtml = await readFile(indexHtmlPath, 'utf8')
  if (runtimeConfig.baseAssetUrl) {
    indexHtml = await transformAssetUrls(
      indexHtml,
      viteConfig.base || '/',
      runtimeConfig.baseAssetUrl,
    )
  }

  fastifyViteDecoration.scope.decorateReply(
    'html',
    await runtimeConfig.createHtmlFunction(indexHtml, fastifyViteDecoration.scope, runtimeConfig),
  )

  if (runtimeConfig.hasRenderFunction && client) {
    const renderFunction = await runtimeConfig.createRenderFunction(
      client,
      fastifyViteDecoration.scope,
      runtimeConfig,
    )
    fastifyViteDecoration.scope.decorateReply('render', renderFunction)
  }

  return client
}

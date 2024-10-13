const { join, resolve } = require('node:path')
const FastifyStatic = require('@fastify/static')
const { parse, resolveIfRelative, read, exists } = require('../ioutils.cjs')

function fileUrl(str) {
  if (typeof str !== 'string') {
    throw new Error('Expected a string')
  }

  let pathName = resolve(str).replace(/\\/g, '/')

  // Windows drive letter must be prefixed with a slash
  if (pathName[0] !== '/') {
    pathName = `/${pathName}`
  }

  return encodeURI(`file://${pathName}`)
}

async function setup(config) {
  const { spa, vite } = config
  let clientOutDir
  let serverOutDir

  if (vite.fastify) {
    clientOutDir = resolveIfRelative(vite.fastify.clientOutDir, vite.root)
    serverOutDir = resolveIfRelative(vite.fastify.serverOutDir || '', vite.root)
  } else {
    // Backwards compatibility for projects that do not use the viteFastify plugin.
    const outDir = resolveIfRelative(vite.build.outDir, vite.root)

    clientOutDir = resolve(outDir, 'client')
    serverOutDir = resolve(outDir, 'server')
  }

  // For production you get the distribution version of the render function
  const { assetsDir } = vite.build

  if (!exists(clientOutDir)) {
    throw new Error('No client distribution bundle found.')
  }

  if (!spa && !exists(serverOutDir)) {
    throw new Error('No server distribution bundle found.')
  }

  // We also register fastify-static to serve all static files
  // in production (dev server takes of this)
  await this.scope.register(async function assetFiles(scope) {
    const root = [resolve(clientOutDir, assetsDir)]
    if (exists(resolve(serverOutDir, assetsDir))) {
      root.push(resolve(serverOutDir, assetsDir))
    }
    await scope.register(FastifyStatic, {
      root,
      prefix: join(vite.base || '/', assetsDir).replace(/\\/g, '/'),
    })
  })

  // And again for files in the public/ folder
  await this.scope.register(async function publicFiles(scope) {
    await scope.register(FastifyStatic, {
      root: clientOutDir,
      allowedPath(path) {
        return path !== '/index.html'
      },
    })
  })

  // Note: this is just to ensure it works, for a real world
  // production deployment, you'll want to capture those paths in
  // Nginx or just serve them from a CDN instead

  Object.defineProperty(config, 'hasRenderFunction', {
    writable: false,
    value: typeof config.createRenderFunction === 'function',
  })

  // Load routes from client module (server entry point)
  const { module: clientModule, ssrManifest } = await loadClient()

  // Make SSR Manifest available in the config
  Object.defineProperty(config, 'ssrManifest', {
    writable: false,
    value: ssrManifest,
  })

  const client = await config.prepareClient(clientModule, this.scope, config)

  // Set reply.html() function with production version of index.html
  this.scope.decorateReply(
    'html',
    await config.createHtmlFunction(
      config.bundle.indexHtml,
      this.scope,
      config,
    ),
  )

  if (config.hasRenderFunction) {
    // Set reply.render() function with the client module production bundle
    const renderFunction = await config.createRenderFunction(
      client,
      this.scope,
      config,
    )
    this.scope.decorateReply('render', renderFunction)
  }

  return { client, routes: client?.routes }

  // Loads the Vite application server entry point for the client
  async function loadClient() {
    if (config.spa) {
      return {}
    }
    const ssrManifestPath = resolve(clientOutDir, '.vite', 'ssr-manifest.json')
    const ssrManifest =
      process.platform === 'win32'
        ? new URL(fileUrl(ssrManifestPath))
        : ssrManifestPath
    const parsedNamed = parse(config.clientModule.replace('/:', '/_')).name
    const serverFiles = [`${parsedNamed}.js`, `${parsedNamed}.mjs`]
    let serverBundlePath
    for (const serverFile of serverFiles) {
      // Use file path on Windows
      serverBundlePath =
        process.platform === 'win32'
          ? new URL(fileUrl(resolve(serverOutDir, serverFile)))
          : resolve(serverOutDir, serverFile)
      if (await exists(serverBundlePath)) {
        break
      }
    }
    let serverBundle = await import(serverBundlePath)
    if (typeof serverBundle.default === 'function') {
      serverBundle = await serverBundle.default(config)
    }
    return {
      module: serverBundle.default || serverBundle,
      ssrManifest: JSON.parse(await read(ssrManifest, 'utf8')),
    }
  }
}

module.exports = {
  setup,
}

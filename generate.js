const Fastify = require('fastify')
const { parse: parsePath } = require('path')
const matchit = require('matchit')
const { parse: parseHTML } = require('node-html-parser')
const { write, ensure, exists } = require('../ioutils')

const pMap = (iterator, mapper) => Promise.all(
  iterator.map(() => mapper()),
)

async function worker (iterator, mapper) {
  try {
    return await pMap(iterator, mapper, { concurrency: 64 })
  } catch (err) {
    this.scope.log.error(err)
  }
}

function extractPayload (source, jsonPath) {
  const parsed = parseHTML(source)
  const scripts = parsed.querySelectorAll('script')
  for (const script of scripts) {
    if (script.innerHTML && script.innerHTML.includes('kPayload')) {
      // eslint-disable-next-line no-eval
      const hydrator = (0, eval)(`(function (window) {\n${script.innerHTML}\n})`)
      const hydration = {}
      hydrator(hydration)
      return {
        html: `${
          source.slice(0, script.range[0])
        }<script>window[Symbol.for('kStaticPayload')] = '${jsonPath}'</script>${
          source.slice(script.range[1])
        }`,
        json: hydration[Symbol.for('kPayload')],
      }
    }
  }
  return {
    html: source,
  }
}

async function getURLs (scope, urls, routes) {
  if (Array.isArray(urls)) {
    return urls
  }
  if (typeof urls === 'function') {
    return await urls(scope, url => urls.push(url))
  } else {
    for (const route of routes) {
      if (matchit.parse(route.path).every(segment => segment.type === 0)) {
        urls.push(route.path)
      }
    }
    return urls
  }
}

function handleResponse (url, response) {
  const name = url.pathname.slice(1)
  const htmlPath = name ? `${name}/index.html` : 'index.html'
  const jsonPath = name ? `${name}/index.json` : 'index.json'
  const { html, json } = extractPayload(response.payload, `/${jsonPath}`)
  return [
    [htmlPath, html],
    [jsonPath, json],
  ]
}

module.exports = async function generate () {
  const { generate } = this.options
  const urls = generate
    ? getURLs(this.scope, generate.urls ?? [], this.routes)
    : [generate.url]
  await worker.call(this, urls, async (url) => {
    const response = await this.scope.inject({ url })
    const files = await handleResponse(url, response)
    await writeFiles.call(this, response, files)
  })
  if (generate.server.enabled) {
    await startGenerateServer.call(this, generate.server.port)
  }
}

async function writeFiles (response, files) {
  for (const [path, contents] of files) {
    const { dir } = parsePath(path)
    if (!exists(dir)) {
      await ensure(dir)
    }
    await write(path, contents)
    setImmediate(() => {
      this.runHook('onGenerate', this.scope, response, this.options.vite.distDir)
    })
  }
}

async function startGenerateServer (port) {
  const generator = Fastify({ logger: true })
  generator.get('*', async (req, reply) => {
    const url = req.raw.url
    const response = await this.scope.inject({ url })
    if (response) {
      const files = await handleResponse(url, response)
      await writeFiles.call(this, response, files)
      reply.code(201)
      reply.send('')
    }
  })
  try {
    await generator.listen(port)
  } catch (err) {
    this.scope.log.error(err)
    setImmediate(() => process.exit(1))
  }
}

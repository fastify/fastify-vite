const { parse: parsePath, resolve } = require('path')
// TODO use fs functions from a single source
const { writeFile } = require('fs').promises
const { ensureDir } = require('fs-extra')
const { existsSync } = require('fs')
const { parse: parseHTML } = require('node-html-parser')

async function generateRoute (request, path, options) {
  try {
    const { payload: htmlWithPayload } = await request
    const name = path.slice(1)
    let htmlPath
    let jsonPath
    let jsonURL
    if (name) {
      jsonURL = `${name}/index.json`
      htmlPath = resolve(options.distDir, 'client', `${name}/index.html`)
      jsonPath = resolve(options.distDir, 'client', jsonURL)
    } else {
      jsonURL = 'index.json'
      htmlPath = resolve(options.distDir, 'client', 'index.html')
      jsonPath = resolve(options.distDir, 'client', jsonURL)
    }
    const { html, json } = extractPayload(htmlWithPayload, `/${jsonURL}`)
    const { dir } = parsePath(htmlPath)
    if (!existsSync(dir)) {
      await ensureDir(dir)
    }
    if (json) {
      await writeFile(jsonPath, JSON.stringify(json, null, 2))
    }
    await writeFile(htmlPath, html)
    return { htmlPath, url: path, html: htmlWithPayload, json }
  } catch (err) {
    console.error(err)
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
  return { html: source }
}

module.exports = {
  generateRoute,
}

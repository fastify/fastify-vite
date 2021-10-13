const { parse: parseHTML } = require('node-html-parser')
const { addScript } = require('./client')

function packIsland (id, loader) {
  return (req, reply, payload, done) => {
    const result = {
      scripts: [],
      links: [],
      markup: null,
    }
    try {
      const host = req.headers.host
      const parsed = parseHTML(payload)
      const scripts = parsed.querySelectorAll('script')
      const links = parsed.querySelectorAll('link')
      for (const link of links) {
        if (link.attributes.rel === 'modulepreload') {
          result.scripts.push({
            type: 'module',
            src: `//${host}${link.attributes.href}`,
          })
        } else {
          result.links.push(`<link ${link.rawAttrs}>`)
        }
      }
      for (const script of scripts) {
        result.scripts.push({
          type: script.attributes.type,
          src: `//${host}${script.attributes.src}`,
        })
      }
      let markup = parsed.querySelector(id)
      if (markup) {
        markup = payload.slice(...markup.range)
        result.markup = markup
      }
      let html = `${result.markup}\n`
      for (const link of result.links) {
        html += `${link}\n`
      }
      if (result.scripts.length) {
        html += '<script>\n'
        html += `${loader.toString()}\n`
        html += `${addScript.toString()}\n`
        html += `${loader.name}(() => {\n`
        for (const script of result.scripts) {
          html += `addScript('${script.src}', '${script.type}')\n`
        }
        html += '})\n</script>\n'
      }
      done(null, html)
    } catch (error) {
      done(error, payload)
    }
  }
}

module.exports = { packIsland }

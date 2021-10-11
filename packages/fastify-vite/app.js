const { parse: parseHTML } = require('node-html-parser')
// const devalue = require('devalue')

const { values } = Object

function * getViewRoutes (view) {
  if (view.path && Array.isArray(view.path)) {
    for (const path of view.path) {
      const { default: component, ...viewProps } = view
      yield { path, component, ...viewProps }
    }
  } else if (view.path) {
    const { path, default: component, ...viewProps } = view
    yield { path, component, ...viewProps }
  } else {
    throw new Error('View components need to export a `path` property.')
  }
}

function loadRoutes (views) {
  const routes = []
  for (const view of values(views)) {
    for (const route of getViewRoutes(view)) {
      routes.push(route)
    }
  }
  return routes.sort((a, b) => {
    if (b.path > a.path) {
      return 1
    } else if (a.path > b.path) {
      return -1
    } else {
      return 0
    }
  })
}

function getIsland (url) {
  const src = new URL(url).pathname
  return (
    document.querySelector(`script[src$="${src}"]`) ||
    document.querySelector(`link[href="${src}"]`)
  )
}

function packIsland (id) {
  return (req, reply, payload, done) => {
    const result = {
      scripts: [],
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
      let html = ''
      for (const script of result.scripts) {
        html += `<script src="${script.src}" type="${script.type}"></script>\n`
      }
      html += result.markup
      done(null, html)
    } catch (error) {
      done(error, payload)
    }
  }
}

module.exports = {
  getViewRoutes,
  loadRoutes,
  getIsland,
  packIsland,
}

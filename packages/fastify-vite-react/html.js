function renderDevHTMLTemplate (req, { element, hydration, entry, helmet }) {
  return (
    '<!doctype html>\n' +
    `<head>${
      helmet.title.toString()
    }${
      helmet.script.toString()
    }${
      helmet.style.toString()
    }</head>\n` +
    `<body>\n${hydration}\n` +
    `<div id="root">${element}</div>\n` +
    `<script type="module" src="${entry}"></script>\n` +
    '</body>\n' +
    '</html>\n'
  )
}

function renderHTMLTemplate (req, { attrs, head, element, hydration }, template) {
  return template
    .replace('<html>', `<html${attrs.html}>`)
    .replace('<body>', `<body${attrs.body}>`)
    .replace('<!--head.preload-->', head.preload)
    .replace('<!--head.tags-->', head.tags || '')
    .replace('<!--hydration-->', hydration)
    .replace('<!--element-->', element)
}

module.exports = { renderHTMLTemplate, renderDevHTMLTemplate }

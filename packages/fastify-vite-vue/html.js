function renderDevHTMLTemplate (req, { attrs, head, element, hydration, entry }) {
  return (
    '<!DOCTYPE html>\n' +
    `<html${attrs.html ? attrs.html : ''}>\n` +
    `<head>${
        head.preload
    }\n${
        head.tags || ''
    }\n</head>\n` +
    `<body${attrs.body ? attrs.boyd : ''}>\n${hydration}\n` +
    `<div id="app">${element}</div>\n` +
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

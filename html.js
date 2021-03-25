function renderDevHTMLTemplate (req, { attrs, head, element, entry }) {
  return (
    '<!DOCTYPE html>\n' +
    `<html${attrs.html}>\n` +
    `<head>${
        head.preload
    }\n${
        head.tags
    }\n${
        head.script || ''
    }\n</head>\n` +
    `<body${attrs.body}>\n` +
    `<div id="app">${element}</div>\n` +
    `<script type="module" src="${entry}"></script>\n` +
    '</body>\n' +
    '</html>\n'
  )
}

function renderHTMLTemplate (req, { attrs, head, element, entry }, template) {
  return template
    .replace('<html>', `<html${attrs.html}>`)
    .replace('<body>', `<body${attrs.body}>`)
    .replace('<!--head.preload-->', head.preload)
    .replace('<!--head.tags-->', head.tags)
    .replace('<!--script-->', head.script)
    .replace('<!--element-->', element)
}

module.exports = { renderHTMLTemplate, renderDevHTMLTemplate }

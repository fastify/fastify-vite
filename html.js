module.exports = function renderHTMLTemplate (req, { attrs, head, element, entry }) {
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

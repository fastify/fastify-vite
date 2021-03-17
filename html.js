module.exports = function renderHTMLTemplate (req, { attrs, head, element, entry }) {
  console.log('head.api', head.api)
  return (
    '<!DOCTYPE html>\n' +
    `<html${attrs.html}>\n` +
    `<head>${
        head.preload
    }\n${
        head.tags
    }\n${
        head.data
    }\n${
        head.api
    }\n</head>\n` +
    `<body${attrs.body}>\n` +
    `<div id="app">${element}</div>\n` +
    `<script type="module" src="${entry}"></script>\n` +
    '</body>\n' +
    '</html>\n'
  )
}

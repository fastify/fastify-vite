function renderDevHTMLTemplate (req, { element, hydration, entry, helmet }) {
  return (
    '<!doctype html>\n' +
    '<html>\n' +
    `<head>${
      helmet.title.toString()
    }${
      helmet.script.toString()
    }${
      helmet.style.toString()
    }</head>\n` +
    `<body>\n${hydration}\n` +
    `<div id="app">${element}</div>\n` +
    `<script type="module" src="${entry}"></script>\n` +
    '</body>\n' +
    '</html>\n'
  )
}

function renderHTMLTemplate (req, { element, hydration, helmet }, template) {
  return template
    .replace('<!--helmet-->', `${
      helmet.title.toString()
    }${
      helmet.script.toString()
    }${
      helmet.style.toString()
    }`)
    .replace('<!--hydration-->', hydration)
    .replace('<!--element-->', element)
}

module.exports = { renderHTMLTemplate, renderDevHTMLTemplate }

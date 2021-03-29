const renderToString = require('react-dom/server').renderToString

const headTags = []; // mutated during render so you can include in server-rendered template later

exports.renderHTMLTemplate = (req, { headTags = headTags, element }) => {
  return (`
    <!doctype html>
      <head>
      </head>
      <body>
        <div id="root">${renderToString(element)}</div>
      </body>
    </html>
  `)
}
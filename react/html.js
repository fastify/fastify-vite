const renderToString = require('react-dom/server').renderToString

const headTags = []; // mutated during render so you can include in server-rendered template later

exports.renderHTMLTemplate = (req, { headTags = headTags, element, hydration, entry }) => {
  return (`
    <!doctype html>
      <head>
      </head>
      <body>
      <body${attrs.body}>
        ${hydration}
        <div id="root">${renderToString(element)}</div>
        <script type="module" src="${entry}"></script> 
      </body>
    </html>
  `)
}
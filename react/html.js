exports.renderHTMLTemplate = (req, { element, hydration, entry, context }) => {
  return (`
    <!doctype html>
      <head>
      </head>
      <body>
      <body>
        ${hydration}
        <div id="root">${element}</div>
        <script type="module" src="${entry}"></script> 
      </body>
    </html>
  `)
}

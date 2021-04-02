exports.renderHTMLTemplate = (req, { element, hydration, entry, helmet }) => {
  return (`
    <!doctype html>
      <head>
        ${helmet.title.toString()}
        ${helmet.script.toString()}
        ${helmet.style.toString()}
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

import 'htmx.org'
import '/base.css'

const allClientImports = { 
  ...import.meta.glob('/**/*.css'),
  ...import.meta.glob('/**/*.client.js'),
}

const clientImports = window[Symbol.for('clientImports')]

Promise.all(clientImports.map((clientImport) => {
  return allClientImports[clientImport]()
}))

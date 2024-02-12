import 'htmx.org'
import '/base.css'

const allClientImports = { 
  ...import.meta.glob('/views/*.css'),
  ...import.meta.glob('/views/*.client.js')
}

const clientImports = window[Symbol.for('clientImports')]

Promise.all(clientImports.map((clientImport) => {
  return allClientImports[clientImport]()
}))

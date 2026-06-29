import { createServer } from 'vite'
import rsc from '@vitejs/plugin-rsc'
import path from 'path'
import { createRequire } from 'module'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

// Simulate the same resolution logic as in the plugin
let rscPkgResolved
const rscRequire = createRequire(import.meta.url)
rscPkgResolved = rscRequire.resolve('@vitejs/plugin-rsc').replace(/\\/g, '/')
rscPkgResolved = rscPkgResolved.replace(/\/dist\/index\.js$/, '')

console.log('rscPkgResolved (root):', rscPkgResolved)
console.log('rscPkgResolved + /dist:', rscPkgResolved + '/dist')

const vendorSpecifier = '@vitejs/plugin-rsc/vendor/react-server-dom/client.browser'
const expectedPath = rscPkgResolved + '/dist/vendor/react-server-dom/client.browser.js'
import fs from 'fs'
console.log('\nExpected file exists:', fs.existsSync(expectedPath) ? 'YES' : 'NO')

// Check directory listing
console.log('\nContents of dist/vendor/react-server-dom/:')
try {
  console.log(fs.readdirSync(rscPkgResolved + '/dist/vendor/react-server-dom/'))
} catch (e) {
  console.log('ERROR:', e.message)
}

// Quick Vite resolution test
const server = await createServer({
  root: process.cwd(),
  plugins: [rsc({ serverHandler: false })],
  environments: {
    rsc: {
      resolve: {
        alias: [{ find: '@vitejs/plugin-rsc', replacement: rscPkgResolved + '/dist' }],
      },
    },
  },
  server: { middlewareMode: true },
  configFile: false,
})

const rscEnv = server.environments?.rsc
if (rscEnv) {
  try {
    const resolved = await rscEnv.pluginContainer.resolveId(vendorSpecifier, undefined, {
      skip: null,
    })
    console.log('\nVite resolution result:', JSON.stringify(resolved, null, 2))
  } catch (err) {
    console.error('\nVite resolution failed:', err.message)
  }
} else {
  console.log('\nNo rsc environment found')
}

await server.close()
process.exit(0)

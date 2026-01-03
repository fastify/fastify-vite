import { join } from 'node:path'
import { fs } from 'zx'

const rootDir = join(import.meta.dirname, '..', '..', '..')
const pkgDir = join(import.meta.dirname, '..')

const templateSrc = join(rootDir, 'examples', 'react-vanilla-spa')
const templateDest = join(pkgDir, 'templates', 'react-spa')

fs.removeSync(join(pkgDir, 'templates'))
fs.copySync(templateSrc, templateDest, {
  filter: (src) => !src.includes('node_modules') && !src.includes('.test.'),
})
console.log('Copied template files to templates/react-spa')

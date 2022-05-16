const { join, resolve, parse, dirname, basename } = require('path')
const { writeFile, readFile } = require('fs/promises')
const { existsSync, lstatSync } = require('fs')
const { ensureDir } = require('fs-extra')
const klaw = require('klaw')

async function * walk (dir, ignorePatterns = []) {
  const sliceAt = dir.length + (dir.endsWith('/') ? 0 : 1)
  for await (const match of klaw(dir)) {
    const pathEntry = match.path.slice(sliceAt)
    if (ignorePatterns.some(ignorePattern => ignorePattern.test(match.path))) {
      continue
    }
    if (pathEntry === '') {
      continue
    }
    yield { stats: match.stats, path: pathEntry }
  }
}

module.exports = {
  parse,
  join,
  resolve,
  walk,
  dirname,
  basename,
  write: writeFile,
  read: readFile,
  exists: existsSync,
  stat: lstatSync,
  ensure: ensureDir,
}

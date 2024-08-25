const { existsSync, lstatSync } = require('node:fs')
const { writeFile, readFile } = require('node:fs/promises')
const { isAbsolute, join, resolve, parse, dirname, basename } = require('node:path')
const { ensureDir, remove } = require('fs-extra')
const klaw = require('klaw')

function resolveIfRelative(p, root) {
  return isAbsolute(p) ? p : resolve(root, p)
}

async function* walk(dir, ignorePatterns = []) {
  const sliceAt = dir.length + (dir.endsWith('/') ? 0 : 1)
  for await (const match of klaw(dir)) {
    const pathEntry = match.path.slice(sliceAt)
    if (
      ignorePatterns.some((ignorePattern) => ignorePattern.test(match.path))
    ) {
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
  resolveIfRelative,
  walk,
  dirname,
  basename,
  remove,
  write: writeFile,
  read: readFile,
  exists: existsSync,
  stat: lstatSync,
  ensure: ensureDir,
}

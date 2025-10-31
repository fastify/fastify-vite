const { existsSync, lstatSync } = require('node:fs')
const { writeFile, readFile } = require('node:fs/promises')
const {
  isAbsolute,
  join,
  resolve,
  parse,
  dirname,
  basename,
  sep,
} = require('node:path')
const { ensureDir, remove } = require('fs-extra')
const klaw = require('klaw')

function getAppRoot() {
  const file = require?.main?.filename || process.argv[1]
  if (!file) return

  return dirname(resolve(file))
}

async function resolveIfRelative(p, root) {
  if (isAbsolute(p)) return p
  if (isAbsolute(root)) return resolve(root, p)
  if (existsSync(resolve(root, p))) return resolve(root, p)

  const { packageDirectory } = await import('package-directory')
  let _packageDirectory = await packageDirectory()

  if (!_packageDirectory) {
    _packageDirectory = await packageDirectory({
      cwd: getAppRoot() || process.cwd(),
    })
  }

  return resolve(_packageDirectory, root, p)
}

async function determineOutDirRoot(vite) {
  const { usePathsRelativeToAppRoot } = vite.fastify
  if (usePathsRelativeToAppRoot) {
    const { packageDirectory } = await import('package-directory')
    const _packageDirectory = await packageDirectory()
    if (_packageDirectory) {
      return _packageDirectory
    }

    return await packageDirectory({
      cwd: getAppRoot() || process.cwd(),
    })
  }

  return vite.root
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
  isAbsolute,
  sep,
  getAppRoot,
  determineOutDirRoot,
  write: writeFile,
  read: readFile,
  exists: existsSync,
  stat: lstatSync,
  ensure: ensureDir,
}

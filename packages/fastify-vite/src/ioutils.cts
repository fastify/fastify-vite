import { existsSync, lstatSync, Stats } from 'node:fs'
import { writeFile, readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve, parse, dirname, basename, sep } from 'node:path'
import { ensureDir, remove } from 'fs-extra'
import klaw from 'klaw'

export function resolveIfRelative(p: string, root: string, f: string): string {
  return isAbsolute(p) ? p : resolve(root, p)
}

export async function* walk(
  dir: string,
  ignorePatterns: RegExp[] = [],
): AsyncIterable<{ stats: Stats; path: string }> {
  const sliceAt = dir.length + (dir.endsWith('/') ? 0 : 1)
  for await (const match of klaw(dir)) {
    const pathEntry = match.path.slice(sliceAt)
    if (ignorePatterns.some((ignorePattern) => ignorePattern.test(match.path))) {
      continue
    }
    if (pathEntry === '') {
      continue
    }
    yield { stats: match.stats, path: pathEntry }
  }
}

export {
  parse,
  join,
  resolve,
  dirname,
  basename,
  remove,
  isAbsolute,
  sep,
  writeFile as write,
  readFile as read,
  existsSync as exists,
  lstatSync as stat,
  ensureDir as ensure,
}

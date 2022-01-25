import path from 'path'
import slash from 'slash'
import hash from 'hash-sum'
import { parse } from '@vue/component-compiler-utils'
import * as vueTemplateCompiler from 'vue-template-compiler'

const cache = new Map()
const prevCache = new Map()

export function createDescriptor (
  source,
  filename,
  { root, isProduction, vueTemplateOptions },
) {
  const descriptor = parse({
    source,
    compiler: vueTemplateOptions?.compiler || vueTemplateCompiler,
    filename,
    sourceRoot: root,
    needMap: true,
  })
  // v2 hasn't generate template and customBlocks map
  // ensure the path is normalized in a way that is consistent inside
  // project (relative to root) and on different systems.
  const normalizedPath = slash(path.normalize(path.relative(root, filename)))
  descriptor.id = hash(normalizedPath + (isProduction ? source : ''))

  cache.set(slash(filename), descriptor)
  return descriptor
}

export function getPrevDescriptor (filename) {
  return prevCache.get(slash(filename))
}

export function setPrevDescriptor (filename, entry) {
  prevCache.set(slash(filename), entry)
}

export function getDescriptor (filename, errorOnMissing = true) {
  const descriptor = cache.get(slash(filename))
  if (descriptor) {
    return descriptor
  }
  if (errorOnMissing) {
    throw new Error(
      `${filename} has no corresponding SFC entry in the cache. ` +
        'This is a vite-plugin-vue2 internal error, please open an issue.',
    )
  }
}

export function setDescriptor (filename, entry) {
  cache.set(slash(filename), entry)
}

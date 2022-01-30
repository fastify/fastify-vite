const path = require('path')
const slash = require('slash')
const hash = require('hash-sum')
const { parse } = require('@vue/component-compiler-utils')
const vueTemplateCompiler = require('vue-template-compiler')

const cache = new Map()
const prevCache = new Map()

function createDescriptor (
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

function getPrevDescriptor (filename) {
  return prevCache.get(slash(filename))
}

function setPrevDescriptor (filename, entry) {
  prevCache.set(slash(filename), entry)
}

function getDescriptor (filename, errorOnMissing = true) {
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

function setDescriptor (filename, entry) {
  cache.set(slash(filename), entry)
}

module.exports = {
  createDescriptor,
  getPrevDescriptor,
  setPrevDescriptor,
  getDescriptor,
  setDescriptor,
}

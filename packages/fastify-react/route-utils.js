const param = /\[([.\w]+\+?)\]/

export function filePathToRoutePath(importPath) {
  return importPath
    .slice(6, -4) // Remove /pages and extension
    .replace(param, (_, m) => `:${m}`)
    .replace(/:\w+\+/, '*')
    .replace(/\/index$/, '/')
    .replace(/(.+)\/+$/, '$1')
}

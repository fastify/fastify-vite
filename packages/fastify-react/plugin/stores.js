
export function generateStores(keys) {
  let code = `
import { useRouteContext } from '@fastify/react/client'

function storeGetter (proxy, prop) {
  if (!proxy.context) {
    proxy.context = useRouteContext()
  }
  if (prop === 'state') {
    return proxy.context.state[proxy.key]
  }
  let method
  if (method = proxy.context.actions?.[proxy.key]?.[prop]) {
    if (!proxy.wrappers[prop]) {
      proxy.wrappers[prop] = (...args) => {
        return method(proxy.context.state, ...args)
      }
    }
    return proxy.wrappers[prop]
  }
}
`
  for (const key of keys) {
    code += `
export const ${key} = new Proxy({
  key: '${key}',
  wrappers: {},
  context: null,
}, {
  get: storeGetter
})
`
  }
  return {
    code,
    map: null
  }
}

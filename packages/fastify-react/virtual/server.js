// RSC entry point

import { PassThrough } from 'node:stream';
import { memoize } from '@hiogawa/utils'
import { ok } from 'node:assert'
import { renderToPipeableStream, registerClientReference } from 'react-server-dom-webpack/server'
import { createElement } from 'react'

// Used directly by the SSR environment
export function renderRoute (match) {
  // initClientReferences()
  // SSR the actual page route as a server component
  const { pipe: pipeRoute } = renderToPipeableStream(
    createElement(match[0].route.element), 
    createBundlerConfig()
  )
  return pipeRoute(new PassThrough()) 
}

// Used when transforming client components in the RSC environment
export function $$register(id, name) {
  // https://github.com/facebook/react/blob/c8a035036d0f257c514b3628e927dd9dd26e5a09/packages/react-server-dom-webpack/src/ReactFlightWebpackReferences.js#L43

  // $$id: /src/components/counter.tsx#Counter
  //   ⇕
  // id: /src/components/counter.tsx
  // name: Counter

  // Reuse everything but $$async: true for simplicity
  const reference = registerClientReference({}, id, name);
  return Object.defineProperties(
    {},
    {
      ...Object.getOwnPropertyDescriptors(reference),
      $$async: { value: true },
    },
  );
}

// Overrides __webpack_require__
async function importClientReference(id) {
  if (import.meta.env.DEV) {
    return import(/* @vite-ignore */ id)
  } else {
    const clientReferences = await import(
      'virtual:client-references'
    )
    const dynImport = clientReferences.default[id];
    ok(dynImport, `client reference not found '${id}'`)
    return dynImport()
  }
}

export function initClientReferences() {
  Object.assign(globalThis, {
    __vite_react_server_webpack_require__: memoize(importClientReference),
    __webpack_require__: memoize(importClientReference)
  })
}

globalThis.__vite_react_server_webpack_require__ = memoize(importClientReference)
globalThis.__webpack_require__ = memoize(importClientReference)

function createBundlerConfig() {
  return new Proxy(
    {},
    {
      get(_target, $$id, _receiver) {
        let [id, name] = $$id.split("#");
        return { id, name, chunks: [] };
      },
    },
  );
}

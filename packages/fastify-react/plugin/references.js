
import { ok } from 'node:assert'
import path from 'node:path'
import { transformDirectiveProxyExport } from '@hiogawa/transforms'
import { parseAstAsync } from 'vite';
import { createVirtualPlugin } from './utils.js'

if (!process.argv.includes('build')) {
  delete globalThis.__VITE_REACT_SERVER_MANAGER
}

class PluginStateManager {
  constructor() {
    this.config = null
    this.buildStep = 'scan'
    this.clientReferenceMap = new Map()
    this.serverReferenceMap = new Map()
  }
}

export const manager = (globalThis.__VITE_REACT_SERVER_MANAGER ??= new PluginStateManager())

export function vitePluginUseClient() {
  /*
    [input]

      'use client'
      export function Counter() {}

    [output]

      import { registerClientReference as $$register } from <runtime>
      export const Counter = $$register(<id>, 'Counter');

  */
  const transformPlugin = {
    name: vitePluginUseClient.name + ':transform',
    async transform(code, id, _options) {
      if (!['rsc'].includes(this.environment.name)) {
        return;
      }
      manager.clientReferenceMap.delete(id)
      if (code.includes('use client')) {
        const runtimeId = await normalizeReferenceId(id, 'client')
        const ast = await parseAstAsync(code)
        let output = await transformDirectiveProxyExport(ast, {
          directive: 'use client',
          id: runtimeId,
          runtime: '$$register',
        })
        if (output) {
          manager.clientReferenceMap.set(id, runtimeId)
          if (manager.buildStep === 'scan') {
            return
          }
          output.prepend(
            `import { $$register } from '/src/react-server.js';`,
          )
          return { 
            code: output.toString(), 
            map: output.generateMap() }
        }
      }
      return
    },
  }

  /*
    [output]

      export default {
        <id>: () => import('<id>'),
        ...
      }

  */
  const virtualPlugin = createVirtualPlugin(
    'client-references',
    function () {
      ok(this.environment?.mode === "build")

      return [
        `export default {`,
        ...[...manager.clientReferenceMap.entries()].map(
          ([id, runtimeId]) => `"${runtimeId}": () => import("${id}"),\n`,
        ),
        `}`,
      ].join('\n');
    },
  );

  const patchPlugin = {
    name: 'patch-react-server-dom-webpack',
    transform(code, id, _options) {
      if (
        this.environment?.name === "rsc"
      ) {
        console.log(id)
        // Rename webpack markers in react server runtime
        // to avoid conflict with ssr runtime which shares same globals
        code = code.replaceAll(
          '__webpack_require__',
          '__vite_react_server_webpack_require__',
        );
        code = code.replaceAll(
          '__webpack_chunk_load__',
          '__vite_react_server_webpack_chunk_load__',
        )

        // Make server reference async for simplicity (stale chunkCache, etc...)
        // see TODO in https://github.com/facebook/react/blob/33a32441e991e126e5e874f831bd3afc237a3ecf/packages/react-server-dom-webpack/src/ReactFlightClientConfigBundlerWebpack.js#L131-L132
        code = code.replaceAll('if (isAsyncImport(metadata))', 'if (true)')
        code = code.replaceAll('4 === metadata.length', 'true')

        return { code, map: null }
      }
      return
    },
  };

  return [transformPlugin, patchPlugin, virtualPlugin]
}

async function normalizeReferenceId(id, name/* client|rsc|ssr */) {
  if (manager.config.command === 'build') {
    return hashString(path.relative(manager.config.root, id))
  }

  // Need to align with what Vite import analysis would rewrite
  // to avoid double modules on browser and SSR
  const devEnv = globalThis.server.environments[name]
  const transformed = await devEnv.transformRequest('virtual:normalize-url/' + encodeURIComponent(id))
  ok(transformed)
  let runtimeId
  switch (name) {
    case 'client': {
      const m = transformed.code.match(/import\(["'](.*)["']\)/)
      runtimeId = m?.[1]
      break
    }
    case 'ssr': {
      const m = transformed.code.match(/import\(["'](.*)["']\)/)
      runtimeId = m?.[1]
      break
    }
    case 'rsc': {
      // `dynamicDeps` is available for ssrTransform
      runtimeId = transformed.dynamicDeps?.[0]
      break
    }
  }
  ok(runtimeId)
  return runtimeId
}

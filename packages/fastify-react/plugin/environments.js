import { ok } from 'node:assert'
import { createHash } from "node:crypto";
import path from "node:path";
import { type ResolvedConfig, defineConfig, createServerModuleRunner } from 'vite'
import react from '@vitejs/plugin-react'
import { transformDirectiveProxyExport, transformServerActionServer } from "@hiogawa/transforms";
import { parseAstAsync } from "vite";
import { createVirtualPlugin, vitePluginSilenceDirectiveBuildWarning } from "./src/shell/plugins.ts";

export default defineConfig({
  plugins: [
    react(),
    {
      configResolved(config) {
        manager.config = config;
      },
      configureServer(server) {
        const reactServerEnv = server.environments['rsc'];
        // no hmr setup for custom node environment
        const reactServerRunner = createServerModuleRunner(reactServerEnv);
        globalThis.server = server;
        globalThis.reactServerRunner = reactServerRunner;
      }
    },
    vitePluginServerAction(),
    vitePluginUseClient(),
    vitePluginSilenceDirectiveBuildWarning(),
    // vitePluginServerAction(),
    // vitePluginEntryBootstrap(),
    // vitePluginServerCss({ manager }),
    virtualNormalizeUrlPlugin()
  ],
  build: {
    minify: false
  },
  builder: {
    async buildApp(builder) {
      console.log('buildApp()')
      // pre-pass to collect all server/client references
      // by traversing server module graph and going over client boundary
      // TODO: this causes single plugin to be reused by two react-server builds
      manager.buildStep = "scan";
      await builder.build(builder.environments["rsc"]);
      manager.buildStep = undefined;

      await builder.build(builder.environments.rsc)
      await builder.build(builder.environments.client)
      await builder.build(builder.environments.ssr)
    },
  },
  environments: {
    client: {
      dev: {
        optimizeDeps: {
          // [feedback] no optimizeDeps.entries for initial scan?
          // entries: []
          include: [
            "react",
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
            "react-dom",
            "react-dom/client",
            "react-server-dom-webpack/client.browser"
          ],
        },
      },
      build: {
        outDir: "dist/client",
        minify: false,
        sourcemap: true,
        manifest: true,
      },
    },
    ssr: {
      build: {
        outDir: "dist/server",
        sourcemap: true,
        ssr: true,
        emitAssets: true,
        manifest: true,
        rollupOptions: {
          input: {
            index: "/src/entry-server.jsx",
          },
        },
      },
    },
    rsc: {
      resolve: {
        conditions: ['react-server'],
        noExternal: true,
      },
      dev: {
        optimizeDeps: {
          include: [
            "react",
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
            "react-server-dom-webpack/server",
            "react-server-dom-webpack/server.edge",
          ],
        },
      },
      build: {
        outDir: "dist/rsc",
        sourcemap: true,
        ssr: true,
        emitAssets: true,
        manifest: true,
        rollupOptions: {
          input: {
            index: "/src/react-server.js",
          },
        },
      },
    },
  },
})


if (!process.argv.includes('build')) {
  delete globalThis.__VITE_REACT_SERVER_MANAGER
}

class PluginStateManager {
  config!: ResolvedConfig;
  buildStep?: "scan";
  clientReferenceMap = new Map<string, string>();
  serverReferenceMap = new Map<string, string>();
}

const manager = (globalThis.__VITE_REACT_SERVER_MANAGER ??= new PluginStateManager())

function vitePluginUseClient() {
  /*
    [input]

      "use client"
      export function Counter() {}

    [output]

      import { registerClientReference as $$register } from "...runtime..."
      export const Counter = $$register("<id>", "Counter");

  */
  const transformPlugin = {
    name: vitePluginUseClient.name + ":transform",
    async transform(code, id, _options) {
      console.log(_options, id)
      if (!['rsc'].includes(this.environment.name)) {
        return;
      }
      manager.clientReferenceMap.delete(id);
      if (code.includes("use client")) {
        const runtimeId = await normalizeReferenceId(id, "client");
        const ast = await parseAstAsync(code);
        let output = await transformDirectiveProxyExport(ast, {
          directive: "use client",
          id: runtimeId,
          runtime: "$$register",
        });
        if (output) {
          manager.clientReferenceMap.set(id, runtimeId);
          if (manager.buildStep === "scan") {
            return;
          }
          output.prepend(
            `import { $$register } from "/src/react-server.js";`,
          );
          return { 
            code: output.toString(), 
            map: output.generateMap() };
        }
      }
      return;
    },
  };

  /*
    [output]

      export default {
        "<id>": () => import("<id>"),
        ...
      }

  */
  const virtualPlugin = createVirtualPlugin(
    "client-references",
    function () {
      console.log('this.environment?.name', this.environment?.name)
      ok(this.environment?.mode === "build");

      return [
        `export default {`,
        ...[...manager.clientReferenceMap.entries()].map(
          ([id, runtimeId]) => `"${runtimeId}": () => import("${id}"),\n`,
        ),
        `}`,
      ].join("\n");
    },
  );

  const patchPlugin = {
    name: 'patch-react-server-dom-webpack',
    transform(code, id, _options) {
      if (
        this.environment?.name === "rsc"
      ) {
        console.log(id)
        // rename webpack markers in react server runtime
        // to avoid conflict with ssr runtime which shares same globals
        code = code.replaceAll(
          "__webpack_require__",
          "__vite_react_server_webpack_require__",
        );
        code = code.replaceAll(
          "__webpack_chunk_load__",
          "__vite_react_server_webpack_chunk_load__",
        );

        // make server reference async for simplicity (stale chunkCache, etc...)
        // see TODO in https://github.com/facebook/react/blob/33a32441e991e126e5e874f831bd3afc237a3ecf/packages/react-server-dom-webpack/src/ReactFlightClientConfigBundlerWebpack.js#L131-L132
        code = code.replaceAll("if (isAsyncImport(metadata))", "if (true)");
        code = code.replaceAll("4 === metadata.length", "true");

        return { code, map: null };
      }
      return;
    },
  };

  return [transformPlugin, patchPlugin, virtualPlugin];
}


function vitePluginServerAction() {
  /*
    [input]

      "use server"
      export function hello() {}

    [output] (react-server)

      export function hello() { ... }
      import { registerServerReference as $$register } from "...runtime..."
      hello = $$register(hello, "<id>", "hello");

    [output] (client)

      import { createServerReference as $$proxy } from "...runtime..."
      export const hello = $$proxy("<id>", "hello");

  */
  const transformPlugin = {
    name: vitePluginServerAction.name + ":transform",
    async transform(code, id) {
      if (!this.environment || !code.includes('use server') || id.includes('/.vite/deps/')) {
        return
      }
      const ast = await parseAstAsync(code)
      const runtimeId = await normalizeReferenceId(id, 'rsc')
      if (this.environment.name === 'rsc') {
        const { output } = await transformServerActionServer(code, ast, {
          id: runtimeId,
          runtime: '$$register',
        });
        if (output.hasChanged()) {
          manager.serverReferenceMap.set(id, runtimeId);
          output.prepend(
            `import { registerServerReference as $$register } from "/src/features/server-action/server";\n`,
          );
          const code = output.toString()
          console.log('code', code)
          return { code, map: output.generateMap() };
        }
      } else {
        let output = await transformDirectiveProxyExport(ast, {
          id: runtimeId,
          runtime: "$$proxy",
          directive: "use server",
        });
        console.log('output/2', output)
        if (output) {
          manager.serverReferenceMap.set(id, runtimeId);
          const runtime =
            this.environment.name === "client" ? "browser" : "ssr";
          output.prepend(
            `import { createServerReference as $$proxy } from "/src/features/server-action/${runtime}";\n`,
          );
          const code = output.toString()
          console.log('code', code)
          return { code, map: output.generateMap() };
        }
      }
      return;
    },
  };

  /*
    [output]

      export default {
        "<id>": () => import("<id>"),
        ...
      }

  */
  const virtualServerReference = createVirtualPlugin(
    'server-references',
    async function () {
      if (manager.buildStep === 'scan') {
        return `export default {}`;
      }
      if (
        this.environment?.name === 'rsc' &&
        this.environment.mode === 'build'
      ) {
        return [
          'export default {',
          ...[...manager.serverReferenceMap.entries()].map(
            ([id, runtimeId]) => `'${runtimeId}': () => import('${id}'),\n`,
          ),
          '}',
        ].join('\n');
      }
    },
  );

  return [transformPlugin, virtualServerReference];
}

async function normalizeReferenceId(id, name: "client" | "rsc" | "ssr") {
  if (manager.config.command === "build") {
    return hashString(path.relative(manager.config.root, id));
  }

  // need to align with what Vite import analysis would rewrite
  // to avoid double modules on browser and ssr.
  const devEnv = globalThis.server.environments[name];
  const transformed = await devEnv.transformRequest(
    "virtual:normalize-url/" + encodeURIComponent(id),
  );
  ok(transformed);
  let runtimeId: string | undefined;
  switch (name) {
    case 'client': {
      const m = transformed.code.match(/import\("(.*)"\)/);
      runtimeId = m?.[1];
      break;
    }
    case 'ssr': {
      const m = transformed.code.match(/import\("(.*)"\)/);
      runtimeId = m?.[1];
      break;
    }
    case 'rsc': {
      console.log('transformed.dynamicDeps', transformed.dynamicDeps)
      // `dynamicDeps` is available for ssrTransform
      runtimeId = transformed.dynamicDeps?.[0];
      break;
    }
  }
  console.log({ runtimeId })
  ok(runtimeId);
  return runtimeId;
}

function virtualNormalizeUrlPlugin() {
  return {
    name: virtualNormalizeUrlPlugin.name,
    apply: "serve",
    resolveId(source, _importer, _options) {
      if (source.startsWith("virtual:normalize-url/")) {
        return "\0" + source;
      }
      return;
    },
    load(id, _options) {
      if (id.startsWith("\0virtual:normalize-url/")) {
        id = id.slice("\0virtual:normalize-url/".length);
        id = decodeURIComponent(id);
        return `export default () => import("${id}")`;
      }
      return;
    },
  };
}

export function hashString(v: string) {
  return createHash("sha256").update(v).digest().toString("hex");
}

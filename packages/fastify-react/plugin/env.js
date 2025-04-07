import { defaultServerConditions } from 'vite'

export function createClientEnvironment() {
  return {
    dev: {
      optimizeDeps: {
        // Feedback: No optimizeDeps.entries for initial scan?
        include: [
          'react',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
          'react-dom',
          'react-dom/client',
          'react-server-dom-webpack/client.browser'
        ],
      },
    },
    build: {
      outDir: 'dist/client',
      minify: false,
      sourcemap: true,
      manifest: true,
    },
  }
}

export function createSSREnvironment (clientModule) {
  return {
    build: {
      outDir: `dist/server`,
      sourcemap: true,
      ssr: true,
      emitAssets: true,
      manifest: true,
      rollupOptions: {
        input: {
          index: clientModule
        },
      },
    },
  }
}

export function createRSCEnvironment(rscModule) {
  return {
    resolve: {
      conditions: ['react-server', ...defaultServerConditions],
      noExternal: true,
    },
    dev: {
      optimizeDeps: {
        include: [
          'react',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
          'react-server-dom-webpack/server',
          'react-server-dom-webpack/server.edge',
        ],
      },
    },
    build: {
      outDir: 'dist/rsc',
      sourcemap: true,
      ssr: true,
      emitAssets: true,
      manifest: true,
      rollupOptions: {
        input: {
          index: rscModule
        },
      },
    },
  }
}

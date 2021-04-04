const reactRefresh = require('@vitejs/plugin-react-refresh')

module.exports = {
  esbuild: {
    jsxInject: `import React from 'react';`
  },
  plugins: [
    reactRefresh()
  ],
  // Base build settings, default values
  // for assetsDir and outDir match Vite's defaults
  build: {
    assetsDir: 'assets',
    outDir: 'dist',
    minify: !dev
  }
}

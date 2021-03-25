module.exports = {
  dev: process.env.NODE_ENV !== 'production',
  dataKey: '$data',
  globalDataKey: '$global',
  rootDir: process.cwd(),
  assetsDir: 'assets',
  clientEntryPath: '/entry-client.js',
  serverEntryPath: '/entry-server.js'
}

module.exports = {
  dev: process.env.NODE_ENV !== 'production',
  dataKey: '$data',
  globalDataKey: '$global',
  rootDir: process.cwd(),
  clientEntryPath: '/entry-client.js',
  serverEntryPath: '/entry-server.js'
}

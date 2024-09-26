// This must stay at v3.x until the entire project moves to ESM. v4+ no longer supports CJS.
const findCacheDir = require('find-cache-dir')

module.exports.CACHE_DIR = findCacheDir({ name: '@fastify/vite' })
module.exports.CACHED_VITE_CONFIG_FILE_NAME = 'vite.config.dist.json'

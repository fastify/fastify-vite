import findCacheDir from 'find-cache-dir'

export const CACHE_DIR = findCacheDir({ name: '@fastify/vite' })
export const CACHED_VITE_CONFIG_FILE_NAME = 'vite.config.dist.json'

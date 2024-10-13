import findCacheDir from 'find-cache-dir'

export const CACHE_DIR = findCacheDir({ name: '@fastify/vite' })

if (typeof CACHE_DIR === 'undefined') {
	console.warn(
		'Unable to determine CACHE_DIR.',
		'This is likely because "node_modules/" is not writable due to running in a container.',
		'Setting an environment variable named CACHE_DIR is recommended to get around this.',
		'See https://fastify-vite.dev/guide/getting-started#CACHE_DIR for more details.'
	)
}

export const CACHED_VITE_CONFIG_FILE_NAME = 'vite.config.dist.json'

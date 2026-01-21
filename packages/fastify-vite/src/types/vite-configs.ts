import type { ResolvedConfig as ViteResolvedConfig, UserConfig } from 'vite'

export interface ViteFastifyConfig {
  clientModule?: string
  entryPaths?: Record<string, string>
  outDirs?: Record<string, string>
}

/** The fastify extension added to Vite configs */
export interface WithFastifyConfig {
  fastify?: ViteFastifyConfig
}

/** Vite ResolvedConfig extended with fastify properties */
export interface ExtendedResolvedViteConfig extends ViteResolvedConfig, WithFastifyConfig {}

/** Vite UserConfig extended with fastify properties */
export interface ExtendedUserConfig extends UserConfig, WithFastifyConfig {}

/** The JSON structure written to vite.config.json by the plugin */
export interface SerializableViteConfig extends WithFastifyConfig {
  base?: string
  root?: string
  build?: {
    assetsDir?: string
    outDir?: string
  }
}

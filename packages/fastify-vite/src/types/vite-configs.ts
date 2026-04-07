import type {
  ResolvedBuildOptions as ViteBuildOptions,
  ResolvedConfig as ViteResolvedConfig,
} from 'vite'

export interface ViteFastifyConfig {
  clientModule?: string
  entryPaths?: Record<string, string>
  outDirs?: Record<string, string>
}

declare module 'vite' {
  interface ResolvedConfig {
    fastify?: ViteFastifyConfig
  }
}

/** The JSON structure written to vite.config.json by the plugin */
export interface SerializableViteConfig
  extends Pick<ViteResolvedConfig, 'root'>, Partial<Pick<ViteResolvedConfig, 'base'>> {
  build: Pick<ViteBuildOptions, 'assetsDir' | 'outDir'>
  fastify?: ViteFastifyConfig
}

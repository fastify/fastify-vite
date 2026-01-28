import type {
  ResolvedBuildOptions as ViteBuildOptions,
  ResolvedConfig as ViteResolvedConfig,
} from 'vite'

export interface ViteFastifyConfig {
  clientModule?: string
  entryPaths?: Record<string, string>
  outDirs?: Record<string, string>
}

/** Vite ResolvedConfig extended with fastify properties */
export interface ExtendedResolvedViteConfig extends ViteResolvedConfig {
  fastify?: ViteFastifyConfig
}

/** The JSON structure written to vite.config.json by the plugin */
export interface SerializableViteConfig extends Partial<
  Pick<ExtendedResolvedViteConfig, 'base' | 'fastify'>
> {
  build: Pick<ViteBuildOptions, 'assetsDir' | 'outDir'>
  root: string // not read-only to allow incremental construction
}

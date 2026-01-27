import type { ResolvedConfig as ViteResolvedConfig, ResolvedBuildOptions, UserConfig } from 'vite'

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

/**
 * The resolved Vite config returned in dev mode.
 * Extends ExtendedUserConfig but with build limited to assetsDir and outDir,
 * and fastify guaranteed to be present.
 */
export interface ResolvedDevViteConfig extends Omit<ExtendedUserConfig, 'build' | 'fastify'> {
  fastify: ViteFastifyConfig
  build: Pick<ResolvedBuildOptions, 'assetsDir' | 'outDir'>
}

/**
 * Minimal Vite config interface required by bundle resolution.
 * This is the common interface satisfied by both SerializableViteConfig and ResolvedDevViteConfig.
 */
export interface ViteConfigForBundle {
  fastify?: ViteFastifyConfig
  root?: string
  build?: {
    outDir?: string
  }
}

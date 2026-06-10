/**
 * Options for the Vite plugin exported from `@fastify/vue/plugin`.
 */
export interface ViteFastifyVueOptions {
  /**
   * When true, load virtual modules from `virtual-ts/` (`.ts` sources)
   * instead of `virtual/` (`.js` sources). Set this in TypeScript starter
   * projects so the generated `$app/*` modules match the host project's
   * module language.
   */
  ts?: boolean
}

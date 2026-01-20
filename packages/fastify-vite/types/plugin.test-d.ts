import type { Plugin } from 'vite'
import { describe, expectTypeOf, it } from 'vitest'
import viteFastify, { findCommonPath, type ViteFastifyPluginOptions } from '../dist/plugin.js'

describe('plugin types', () => {
  it('viteFastify returns a Vite Plugin', () => {
    expectTypeOf(viteFastify()).toExtend<Plugin>()
    expectTypeOf(viteFastify({})).toExtend<Plugin>()
    expectTypeOf(viteFastify({ spa: true })).toExtend<Plugin>()
    expectTypeOf(viteFastify({ clientModule: './client.js' })).toExtend<Plugin>()
    expectTypeOf(viteFastify({ spa: false, clientModule: './client.js' })).toExtend<Plugin>()
  })

  it('findCommonPath accepts string array and returns string', () => {
    expectTypeOf(findCommonPath).parameter(0).toEqualTypeOf<string[]>()
    expectTypeOf(findCommonPath(['a', 'b'])).toEqualTypeOf<string>()
  })

  it('ViteFastifyPluginOptions has correct shape', () => {
    const options: ViteFastifyPluginOptions = {}
    expectTypeOf(options.spa).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(options.clientModule).toEqualTypeOf<string | undefined>()
  })
})

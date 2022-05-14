'use strict'

const { reactive } = require('vue')
const { createMemoryHistory, createWebHistory } = require('vue-router')

const isServer = typeof window === 'undefined'

const createRouter = isServer ? createMemoryHistory : createWebHistory

const hydrationKey = Symbol('hydrationKey')

function createDataHydration (router, key) {
  let firstRender = true
  return (app) => {
    router.afterEach(() => {
      if (firstRender) {
        firstRender = false
        return
      }
      if (window[key]) {
        window[key] = undefined
      }
    })
    app.provide(hydrationKey, window[key])
  }
}

async function useDataLoader (loader) {
  const hydration = inject(hydrationKey)
  const state = {
    ...hydration,
    loading: !hydration,
    error: null,
  }
  const promise = () => loader().then((updatedState) => {
    Object.assign(state, updatedState)
    state.loading = false
  }).catch((error) => {
    Object.assign(state, { error, loading: false })
  })
  if (!state.loading || isServer) {
    await promise()
    const ssrContext = useSSRContext()
    ssrContext[hydrationKey] = state.data
    return {
      data: ssrContext[hydrationKey],
      loading: false,
    }
  } else {

  }
  return state
}

module.exports = {
  isServer,
  createRouter,
  createDataHydration,
  hydrationKey,
  useData,
}

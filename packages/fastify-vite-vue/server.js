const { useSSRContext } = require('vue')
const { createRenderApp, createRenderIsland } = require('./render')

const isServer = typeof window === 'undefined'

function useRequest () {
  if (isServer) {
    return useSSRContext().req
  }
}

function useReply () {
  if (isServer) {
    return useSSRContext().reply
  }
}

function useFastify () {
  if (isServer) {
    return useSSRContext().fastify
  }
}

function createServerEntryPoint (client, views) {
  return {
    views,
    renderApp: createRenderApp(client.createApp),
    renderIsland: createRenderIsland(client.createIsland),
  }
}

module.exports = {
  createRenderApp,
  createRenderIsland,
  createServerEntryPoint,
  useRequest,
  useReply,
  useFastify,
}

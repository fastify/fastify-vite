const { useSSRContext } = require('vue')
const { createRenderFunction } = require('./render')

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

module.exports = {
  createRenderFunction,
  useRequest,
  useReply,
  useFastify,
}

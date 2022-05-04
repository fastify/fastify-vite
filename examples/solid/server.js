const { useContext, isServer } = require('solid-js/web')
const { createRenderFunction } = require('./render')
const { Context } = require('./context')

function useRequest () {
  if (isServer) {
    return useContext(Context).req
  }
}

function useReply () {
  if (isServer) {
    return useContext(Context).reply
  }
}

function useFastify () {
  if (isServer) {
    return useContext(Context).fastify
  }
}

module.exports = {
  createRenderFunction,
  useRequest,
  useReply,
  useFastify,
}

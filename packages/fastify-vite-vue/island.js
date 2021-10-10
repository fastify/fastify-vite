
function getRenderer (fastify, options, { renderIsland }) {
  return async function (req, reply, island) {
    const url = req.raw.url
    return renderIsland(fastify, req, reply, url, options, island)
  }
}

function getDevRenderer (fastify, options, { getRenderers }) {
  return async function (req, reply, island) {
    const url = req.raw.url
    const { renderIsland } = await getRenderers()
    return renderIsland(fastify, req, reply, url, options, island)
  }
}

module.exports = {
  getRenderer,
  getDevRenderer,
}

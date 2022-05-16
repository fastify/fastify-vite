
export default {
  createRenderFunction
}

function createRenderFunction ({ createApp }) {
  return async function (server, req, reply) {
    // Creates Vue application instance with all the SSR context it needs
    const app = await createApp({ server, req, reply }, req.raw.url)
    // Perform SSR, i.e., turn app.instance into an HTML fragment
    const element = await renderToString(app.instance, app.ctx)
    // Return variables to index.html template function
    return { element }
  }
}

module.exports = {
  fp: require('fastify-plugin'),
  resolve: require('path').resolve,
  vite: require('vite'),
  middie: require('middie'),
  staticPlugin: require('fastify-static'),
  assign: Object.assign
}

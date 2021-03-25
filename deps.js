module.exports = {
  path: require('path'),
  fs: require('fs'),
  fp: require('fastify-plugin'),
  vite: require('vite'),
  middie: require('middie'),
  staticPlugin: require('fastify-static'),
  defaults: require('./defaults'),
  assign: Object.assign
}

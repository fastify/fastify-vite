let port = 8791
module.exports = () => ({
  root: __dirname,
  server: {
    hmr: {
      port: port++
    }
  },
})

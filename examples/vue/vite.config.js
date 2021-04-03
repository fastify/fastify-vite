const vuePlugin = require('@vitejs/plugin-vue')
const vueJsx = require('@vitejs/plugin-vue-jsx')

module.exports = {
  plugins: [
    vuePlugin(),
    vueJsx()
  ],
  build: {
    minify: false
  }
}

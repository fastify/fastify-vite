const { options } = require('./options')
const { getHandler, getRenderGetter } = require('./handler')
const { renderDevHTMLTemplate, renderHTMLTemplate } = require('./html')

module.exports = {
  options,
  getHandler,
  getRenderGetter,
  renderDevHTMLTemplate,
  renderHTMLTemplate
}

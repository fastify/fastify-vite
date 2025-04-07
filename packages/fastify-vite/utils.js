const { ensureConfigFile, ejectBlueprint } = require('./setup.js')
const { createHtmlTemplateFunction } = require('./html.js')
const { resolveClientModule } = require('./config.js')

module.exports.resolveClientModule = resolveClientModule
module.exports.createHtmlTemplateFunction = createHtmlTemplateFunction
module.exports.ensureConfigFile = ensureConfigFile
module.exports.ejectBlueprint = ejectBlueprint

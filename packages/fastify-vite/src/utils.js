const { ensureConfigFile, ejectBlueprint } = require('./setup.js')
const { createHtmlTemplateFunction } = require('./html.js')

module.exports.createHtmlTemplateFunction = createHtmlTemplateFunction
module.exports.ensureConfigFile = ensureConfigFile
module.exports.ejectBlueprint = ejectBlueprint

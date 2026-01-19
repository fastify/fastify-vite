const { ensureConfigFile, ejectBlueprint } = require('./setup.js')
const { createHtmlTemplateFunction } = require('./html.ts')

module.exports.createHtmlTemplateFunction = createHtmlTemplateFunction
module.exports.ensureConfigFile = ensureConfigFile
module.exports.ejectBlueprint = ejectBlueprint

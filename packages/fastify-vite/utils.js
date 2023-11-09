const { ensureConfigFile, ejectBlueprint } = require('./setup')
const { createHtmlTemplateFunction } = require('./html')
const { ensureESMBuild } = require('./vite')

module.exports.ensureESMBuild = ensureESMBuild
module.exports.createHtmlTemplateFunction = createHtmlTemplateFunction
module.exports.ensureConfigFile = ensureConfigFile
module.exports.ejectBlueprint = ejectBlueprint

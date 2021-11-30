const unescapedBacktick = /(?<!\\)`/g

function compileIndexHtml (source) {
  const indexHtml = (
    '(function (req, { attrs, helmet, element, hydration }, vite) {\n' +
    '  attrs = attrs || {}\n' +
    `  return \`${
      source
        // eslint-disable-next-line no-template-curly-in-string
        .replace('<html>', '<html${attrs.html ? attrs.html : \'\'}>')
        // eslint-disable-next-line no-template-curly-in-string
        .replace('<body>', '<body${attrs.body ? attrs.body : \'\'}>')
        .replace(unescapedBacktick, '\\`')
    }\`\n` +
    '})'
  )
  // eslint-disable-next-line no-eval
  return (0, eval)(indexHtml)
}

module.exports = { compileIndexHtml }

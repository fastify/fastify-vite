const { HTMLRewriter } = require('html-rewriter-wasm')

const jsPath = /^[a-zA-Z_$][a-zA-Z_$.0-9]*$/

async function compileHtmlTemplate(source) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  let output = ''
  let decoded = ''
  let isScriptTag = false
  let isScript = false

  const params = []
  const rewriter = new HTMLRewriter((chunk) => {
    decoded = decoder.decode(chunk)
    if (isScript) {
      decoded = JSON.stringify(decoded).slice(1, -1)
    }
    output += decoded
  })

  rewriter.on('script', {
    element(element) {
      element.prepend('${"')
      element.append('"}')
      isScriptTag = true
    },
    end() {
      isScriptTag = false
    },
  })

  rewriter.onDocument({
    text(text) {
      if (text.lastInTextNode) {
        isScriptTag = false
        isScript = false
        return
      }
      if (isScriptTag) {
        isScript = true
      }
    },
    comments(comment) {
      let trimmed
      // biome-ignore lint/suspicious/noAssignInExpressions: self explanatory
      if (jsPath.test((trimmed = comment.text.trim()))) {
        params.push(trimmed)
        comment.replace(`\${${trimmed} ?? ''}`)
      }
    },
  })

  try {
    await rewriter.write(encoder.encode(source))
    await rewriter.end()
  } finally {
    rewriter.free()
  }

  return [output, params]
}

async function createHtmlTemplateFunction(source) {
  const [compiled, params] = await compileHtmlTemplate(source)
  return new Function(
    params.length
      ? `{ ${[...new Set(params.map(s => s.split('.')[0]))].join(', ')} }`
      : '',
    `return \`${compiled}\``
  )
}

module.exports = {
  createHtmlTemplateFunction,
}

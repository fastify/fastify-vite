const { Readable } = require('node:stream')
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
        comment.replace(`\${${trimmed}}`)
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

// TODO v8: Provide synchronous version for speed
//
// async function createHtmlTemplateFunction(source) {
//   const [compiled, params] = await compileHtmlTemplate(source)
//   // biome-ignore lint/style/noCommaOperator: indirect call to eval() to ensure global scope
//   // biome-ignore lint/security/noGlobalEval: necessary for templating
//   return (0, eval(
//     `(function (${
//       params.length
//         ? `{ ${[...new Set(params.map((s) => s.split('.')[0]))].join(', ')} }`
//         : ''
//     }) {\n  return \`${compiled}\`\n}))`
//   ))
// }

async function createHtmlTemplateFunction(source) {
  const [compiled, params] = await compileHtmlTemplate(source)
  const templatingFunctionSource = `((asReadable) => (function (${
    params.length
      ? `{ ${[...new Set(params.map((s) => s.split('.')[0]))].join(', ')} }`
      : ''
  }) {\n  return asReadable\`${compiled}\`}))`
  // biome-ignore lint/style/noCommaOperator: indirect call to eval() to ensure global scope
  // biome-ignore lint/security/noGlobalEval: necessary for templating
  return (0, eval(templatingFunctionSource))(asReadable)
}

function asReadable(fragments, ...values) {
  return Readable.from(
    (async function* () {
      for (const fragment of fragments) {
        yield fragment
        if (values.length) {
          const value = values.shift()
          if (value instanceof Readable) {
            for await (const chunk of value) {
              yield chunk
            }
          } else if (value && typeof value !== 'string') {
            yield value.toString()
          } else {
            yield value ?? ''
          }
        }
      }
    })(),
  )
}

module.exports = {
  createHtmlTemplateFunction,
}

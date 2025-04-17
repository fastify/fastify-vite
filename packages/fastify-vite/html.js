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

  const processComment = (text) => {
    let trimmed
    if (jsPath.test((trimmed = text.trim()))) {
      params.push(trimmed)
      return `\${${trimmed} ?? ''}`
    }
    return null
  }

  rewriter.on('*', {
    element(element) {
      for (const [name, value] of element.attributes) {
        if (!value) {
          continue
        }
        const commentMatch = value.match(/^#([^#]*)#$/)
        if (commentMatch) {
          const commentText = commentMatch[1]
          const replacement = processComment(commentText)
          if (replacement) {
            element.setAttribute(name, replacement)
          }
        }
      }
    }
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
      const replacement = processComment(comment.text)
      if (replacement) {
        comment.replace(replacement)
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
      ? `{ ${[...new Set(params.map((s) => s.split('.')[0]))].join(', ')} }`
      : '',
    `return \`${compiled}\``,
  )
}

module.exports = {
  createHtmlTemplateFunction,
}
import { HTMLRewriter } from 'html-rewriter-wasm'

const jsPath = /^[a-zA-Z_$][a-zA-Z_$.0-9]*$/

async function compileHtmlTemplate(source: string): Promise<[string, string[]]> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  let output = ''
  let decoded = ''
  let isScriptTag = false
  let isScript = false

  const params: string[] = []
  const rewriter = new HTMLRewriter((chunk) => {
    decoded = decoder.decode(chunk)
    if (isScript) {
      decoded = JSON.stringify(decoded).slice(1, -1)
    }
    output += decoded
  })

  const processComment = (text: string): string | null => {
    const trimmed = text.trim()
    if (jsPath.test(trimmed)) {
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
    },
  })

  rewriter.on('script', {
    element(element) {
      element.prepend('${"')
      element.append('"}')
      isScriptTag = true
      element.onEndTag(() => {
        isScriptTag = false
      })
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

async function createHtmlTemplateFunction(
  source: string,
): Promise<(data?: Record<string, unknown>) => string> {
  const [compiled, params] = await compileHtmlTemplate(source)
  return new Function(
    params.length ? `{ ${[...new Set(params.map((s) => s.split('.')[0]))].join(', ')} }` : '',
    `return \`${compiled}\``,
  ) as (data?: Record<string, unknown>) => string
}

export { createHtmlTemplateFunction }

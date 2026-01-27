const jsPath = /^[a-zA-Z_$][a-zA-Z_$.0-9]*$/
const commentPattern = /<!--\s*([a-zA-Z_$][a-zA-Z_$.0-9]*)\s*-->/g
const scriptTagPattern = /<script(\s[^>]*)?>[\s\S]*?<\/script>/gi

function compileHtmlTemplate(source: string): [string, string[]] {
  const params: string[] = []

  // Process script tags first - escape their content so ${} doesn't get interpreted
  let processed = source.replace(scriptTagPattern, (match) => {
    // JSON.stringify escapes special characters including backticks and ${}
    // We wrap the content in ${"..."} so the template literal preserves it exactly
    const openTagEnd = match.indexOf('>') + 1
    const closeTagStart = match.lastIndexOf('<')

    const openTag = match.slice(0, openTagEnd)
    const content = match.slice(openTagEnd, closeTagStart)
    const closeTag = match.slice(closeTagStart)

    if (content.length === 0) {
      return match
    }

    // Escape the content by JSON.stringify, then strip the outer quotes
    const escaped = JSON.stringify(content).slice(1, -1)
    return `${openTag}\${"${escaped}"}${closeTag}`
  })

  // Replace comment placeholders with template expressions
  processed = processed.replace(commentPattern, (_match, varName) => {
    if (jsPath.test(varName)) {
      params.push(varName)
      return `\${${varName} ?? ''}`
    }
    return _match
  })

  return [processed, params]
}

function createHtmlTemplateFunction(source: string): (data?: Record<string, unknown>) => string {
  const [compiled, params] = compileHtmlTemplate(source)
  return new Function(
    params.length ? `{ ${[...new Set(params.map((s) => s.split('.')[0]))].join(', ')} }` : '',
    `return \`${compiled}\``,
  ) as (data?: Record<string, unknown>) => string
}

export { createHtmlTemplateFunction }

const jsPath = /^[a-zA-Z_$][a-zA-Z_$.0-9]*$/

type HtmlPart = { type: 'literal'; value: string } | { type: 'placeholder'; path: string }

function isWhitespace(char: string | undefined): boolean {
  return char === ' ' || char === '\n' || char === '\r' || char === '\t' || char === '\f'
}

function isTagBoundary(char: string | undefined): boolean {
  return char === undefined || isWhitespace(char) || char === '>' || char === '/'
}

function findTagEnd(source: string, start: number): number {
  let quote: string | undefined

  for (let index = start; index < source.length; index++) {
    const char = source[index]
    if (quote) {
      if (char === quote) {
        quote = undefined
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }

    if (char === '>') {
      return index
    }
  }

  return -1
}

function startsWithTag(source: string, start: number, tagName: string, isClosing = false): boolean {
  const offset = isClosing ? 2 : 1
  if (source[start] !== '<') {
    return false
  }

  if (isClosing && source[start + 1] !== '/') {
    return false
  }

  return (
    source.slice(start + offset, start + offset + tagName.length).toLowerCase() === tagName &&
    isTagBoundary(source[start + offset + tagName.length])
  )
}

function findScriptBlockEnd(source: string, start: number): number {
  const openTagEnd = findTagEnd(source, start)
  if (openTagEnd === -1) {
    return source.length
  }

  let index = openTagEnd + 1
  while (index < source.length) {
    const nextTag = source.indexOf('<', index)
    if (nextTag === -1) {
      return source.length
    }

    if (startsWithTag(source, nextTag, 'script', true)) {
      const closeTagEnd = findTagEnd(source, nextTag)
      return closeTagEnd === -1 ? source.length : closeTagEnd + 1
    }

    index = nextTag + 1
  }

  return source.length
}

function readAttributeValue(tag: string, start: number): [string, number] {
  const quote = tag[start]
  if (quote === '"' || quote === "'") {
    let index = start + 1
    while (index < tag.length && tag[index] !== quote) {
      index++
    }
    return [tag.slice(start + 1, index), index + 1]
  }

  let index = start
  while (index < tag.length && !isWhitespace(tag[index]) && tag[index] !== '>') {
    index++
  }
  return [tag.slice(start, index), index]
}

function hasModuleScriptType(openTag: string): boolean {
  let index = '<script'.length

  while (index < openTag.length) {
    while (isWhitespace(openTag[index])) {
      index++
    }

    const char = openTag[index]
    if (char === undefined || char === '>' || (char === '/' && openTag[index + 1] === '>')) {
      return false
    }

    const nameStart = index
    while (
      index < openTag.length &&
      !isWhitespace(openTag[index]) &&
      openTag[index] !== '=' &&
      openTag[index] !== '>'
    ) {
      index++
    }

    const name = openTag.slice(nameStart, index).toLowerCase()

    while (isWhitespace(openTag[index])) {
      index++
    }

    let value = ''
    if (openTag[index] === '=') {
      index++
      while (isWhitespace(openTag[index])) {
        index++
      }
      ;[value, index] = readAttributeValue(openTag, index)
    }

    if (name === 'type' && value.toLowerCase() === 'module') {
      return true
    }
  }

  return false
}

function compileHtmlTemplate(source: string): HtmlPart[] {
  const parts: HtmlPart[] = []
  let literalStart = 0
  let index = 0

  while (index < source.length) {
    if (startsWithTag(source, index, 'script')) {
      index = findScriptBlockEnd(source, index)
      continue
    }

    if (source.startsWith('<!--', index)) {
      const commentEnd = source.indexOf('-->', index + 4)
      if (commentEnd === -1) {
        break
      }

      const commentText = source.slice(index + 4, commentEnd).trim()
      if (jsPath.test(commentText)) {
        if (literalStart < index) {
          parts.push({ type: 'literal', value: source.slice(literalStart, index) })
        }
        parts.push({ type: 'placeholder', path: commentText })
        literalStart = commentEnd + 3
      }

      index = commentEnd + 3
      continue
    }

    index++
  }

  if (literalStart < source.length) {
    parts.push({ type: 'literal', value: source.slice(literalStart) })
  }

  return parts
}

function getPathValue(data: Record<string, unknown>, path: string): unknown {
  let value: unknown = data

  for (const segment of path.split('.')) {
    if (value == null || typeof value !== 'object') {
      return undefined
    }
    value = (value as Record<string, unknown>)[segment]
  }

  return value
}

function removeHtmlModuleScripts(source: string): string {
  let output = ''
  let literalStart = 0
  let index = 0

  while (index < source.length) {
    if (!startsWithTag(source, index, 'script')) {
      index++
      continue
    }

    const openTagEnd = findTagEnd(source, index)
    if (openTagEnd === -1) {
      break
    }

    const scriptEnd = findScriptBlockEnd(source, index)
    if (hasModuleScriptType(source.slice(index, openTagEnd + 1))) {
      output += source.slice(literalStart, index)
      literalStart = scriptEnd
    }

    index = scriptEnd
  }

  return output + source.slice(literalStart)
}

function createHtmlTemplateFunction(source: string): (data?: Record<string, unknown>) => string {
  const compiled = compileHtmlTemplate(source)

  return (data = {}) => {
    let output = ''

    for (const part of compiled) {
      if (part.type === 'literal') {
        output += part.value
        continue
      }

      const value = getPathValue(data, part.path)
      output += value == null ? '' : String(value)
    }

    return output
  }
}

export { createHtmlTemplateFunction, removeHtmlModuleScripts }

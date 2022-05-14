function createHtmlTemplateFunction (source) {
  const ranges = new Map()
  const interpolated = ['']
  const params = []

  for (const match of source.matchAll(/<!--\s*([\w]+)\s*-->/g)) {
    ranges.set(match.index, {
      param: match[1],
      end: match.index + match[0].length,
    })
  }

  let cursor = 0
  const cut = null
  let range = null

  for (let i = 0; i < source.length; i++) {
    if (i === cut) {
      interpolated.push('')
      cursor += 1
    } else if (ranges.get(i)) {
      range = ranges.get(i)
      params.push(range.param)
      interpolated.push({ param: range.param })
      i = range.end
      interpolated.push('')
      cursor += 2
    }
    interpolated[cursor] += source[i]
  }

  return (0, eval)(
    `(function ({ ${params.join(', ')} }) {` +
    `return \`${interpolated.map(s => serialize(s)).join('')}\`` +
    '})',
  )
}

module.exports = {
  createHtmlTemplateFunction,
}

function serialize (frag) {
  if (typeof frag === 'object') {
    return `$\{${frag.param}}`
  } else {
    return frag
  }
}

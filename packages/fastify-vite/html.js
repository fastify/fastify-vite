const { Readable } = require('stream')

function createHtmlTemplateFunction (source) {
  const ranges = new Map()
  const interpolated = ['']
  const params = []

  for (const match of source.matchAll(/<!--\s*([\.\w]+)\s*-->/g)) {
    ranges.set(match.index, {
      param: match[1],
      end: match.index + match[0].length
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

  // eslint-disable-next-line no-eval
  return (0, eval)(
    `(function ({ ${
      [...new Set(params.map((s) => s.split('.')[0]))].join(', ')
    } }) {` +
    `return asReadable\`${interpolated.map(s => serialize(s)).join('')}\`` +
    '})'
  )
}

function asReadable (fragments, ...values) {
  return Readable.from(async function * () {
    for (const fragment of fragments) {
      yield fragment
      if (values.length) {
        const value = values.shift()
        if (value instanceof Readable) {
          for await (const chunk of value) {
            yield chunk
          }
        } else {
          yield value
        }
      }
    }
  })
}

module.exports = {
  createHtmlTemplateFunction
}

function serialize (frag) {
  if (typeof frag === 'object') {
    return `$\{${frag.param}}`
  } else {
    return frag
  }
}

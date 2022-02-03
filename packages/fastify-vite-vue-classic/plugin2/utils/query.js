const qs = require('querystring')

function parseVueRequest (id) {
  const [filename, rawQuery] = id.split('?', 2)
  const query = qs.parse(rawQuery)
  if (query.vue != null) {
    query.vue = true
  }
  if (query.src != null) {
    query.src = true
  }
  if (query.index != null) {
    query.index = Number(query.index)
  }
  if (query.raw != null) {
    query.raw = true
  }
  return {
    filename,
    query,
  }
}

module.exports = {
  parseVueRequest,
}

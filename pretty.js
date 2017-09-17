const prettyjson = require('prettyjson')

const standard = {
  keysColor: 'yellow',
  dashColor: 'magenta',
  stringColor: 'white'
}

const schemes = { standard }

function pretty (data, scheme = 'standard') {
  if (!data) return

  return prettyjson.render(data, schemes[scheme])
}

module.exports = pretty
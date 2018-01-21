const prettyjson = require('prettyjson')
const version = require('./package.json').version

const standard = {
  keysColor: 'yellow',
  dashColor: 'magenta',
  stringColor: 'white'
}

const schemes = { standard }

function pretty (data, json=false, scheme = 'standard') {
  if (!data) return

  return json 
    ? JSON.stringify(data, null, 2)
    : prettyjson.render(data, schemes[scheme])
}

module.exports = pretty
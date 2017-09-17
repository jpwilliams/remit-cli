const expand = require('expand-object')

function marshal (args) {
  return args.reduce((args, arg) => Object.assign({}, args, expand(arg)), {})
}

module.exports = marshal
const expand = require('expand-object')

function marshal (args) {
  const isArrOrObj = /[,:]/
  const firstArg = isArrOrObj.test(args[0]) ? expand(args[0]) : args[0]

  if (Array.isArray(firstArg) === false && typeof firstArg === 'object') {
    return args.reduce((args, arg) => Object.assign({}, args, expand(arg)), {})
  }

  return firstArg
}

module.exports = marshal
const deepmerge = require('deepmerge')
const expand = require('expand-object')

function setToValue(obj, value, path) {
  path = path.split('.');
  for (i = 0; i < path.length - 1; i++)
      obj = obj[path[i]];

  obj[path[i]] = value;
}

function marshal (args) {
  const isPlainObjectLike = /[,:]/

  const firstArg = isPlainObjectLike.test(args[0]) ? expand(args[0]) : args[0]

  if (Array.isArray(firstArg) === false && typeof firstArg === 'object') {
    return args.reduce((args, arg) => {
      const parts = arg.split(':')

      const k = parts[0]
      const v =  parts[1]

      let result = expand(k)
      let keyParts = k.split('.')

      setToValue(result, v, k)
      return deepmerge(args, result)
    }, {})
      
  }

  return firstArg
}

module.exports = marshal
#! /usr/bin/env node

const expand = require('expand-object')
const program = require('commander')

function collectArgs (val, list) {
  list.push(val)

  return list
}

program
  .version('0.0.1')
  .usage('<target> [options]')
  .option('-e, --emission', 'Emit')
  .option('-l, --listen', 'Listen')
  .option('-k, --keys [str]', 'Key/value pairs from expand-object package', collectArgs, [])
  .option('-d, --data [json]', 'Data')
  .option('-f, --file [path]', 'Data file (overwrites -d)')
  .option('-n, --service-name [name]', 'Service name')
  .option('-u, --url [url]', 'RabbitMQ URL')
  .parse(process.argv)

if (!program.args.length) {
  program.outputHelp()
  process.exit(0)
}

const target = program.args[0]
let data = {}

if (program.file) {
  if (!program.file.startsWith('/') && !program.file.startsWith('.')) {
    program.file = './' + program.file
  }
  data = require(program.file)
} else if (program.data) {
  data = JSON.parse(program.data)
} else if (program.keys && program.keys.length) {
  data = Object.assign(...program.keys.map(expand))
}

let emit = !!program.emission
let listen = !!program.listen

if (emit && listen) {
  console.error('Cannot emit and listen at the same time')
  process.exit(1)
}

let serviceName = program.serviceName || 'remit-cli'
let url = program.url || 'amqp://localhost'

const remit = require('remit')({
  name: serviceName,
  url: url
})

if (emit) {
  remit.emit(target, data)

  setTimeout(() => {
    process.exit(0)
  }, 1000)
} else if (listen) {
  console.log(`Listening to ${target} messagse...`)

  remit.listen(target, function (args) {
    console.log('\n\n', JSON.stringify(args, null, 2))
  })
} else {
  remit.treq(target, data, (err, data) => {
    if (err) {
      console.error(err)
    }

    if (data) {
      console.log(JSON.stringify(data, null, 2))
    }

    process.exit(0)
  })
}

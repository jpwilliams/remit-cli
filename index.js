#!/usr/bin/env node

const pTime = require('p-time')

const pretty = require('./pretty')
const marshal = require('./marshal')

const Vorpal = require('vorpal')
const vorpal = Vorpal()
const chalk = vorpal.chalk

vorpal
  .delimiter(chalk.magenta('remit$'))
  .localStorage('remotes')
 
vorpal.noargs = vorpal.parse(process.argv, {use: 'minimist'})._ === undefined;

// const AMQP_URL = vorpal.localStorage.getItem('default')
// if (!AMQP_URL) vorpal.localStorage.setItem('default', 'amqp://localhost')
// console.log('AMQP_URL', AMQP_URL)

const remit = require('remit')({
  url: 'amqp://dedjmejde' //AMQP_URL
})

// remit.request('foo').send().then(console.log, console.log)
const connection = remit._connection
  .then(c => console.log('ahahahah'))
  .catch((e) => {
    console.log('eh')
    vorpal.log(chalk.red.bold('Failed to connect to RabbitMQ server:', remit._options.url, e))
  })

const logErr = e => vorpal.log(chalk.red.bold.underline('Error'), e)

vorpal
  .command('remote <cmd> [origin] [url]', 'Caches rabbitmq urls for convenience; like git remote' )
  .action(function (props, cb) {
    switch(props.cmd) {
      case 'set_default':
        const target =  vorpal.localStorage.getItem(props.origin)
        vorpal.localStorage.setItem('default', target)
        break
      case 'add':
        vorpal.localStorage.setItem(props.origin, props.url)
        break
      case 'remove':
        vorpal.localStorage.removeItem(props.origin)
        break
      case 'peek':
        if (vorpal.localStorage._localStorage.keys.length === 0) {
          this.log('No remotes yet. Try help command to get started.')
          break
        }
  
        for (let k of vorpal.localStorage._localStorage.keys) {
          this.log('\t', k, vorpal.localStorage.getItem(k))
        }
  
        break
      default:
        this.log('cmd not recognised', { props })
        break
    }

    return cb()
  })

vorpal
  .command('request <endpoint> [args...]', 'Makes a request to a remit endpoint')
  .option('-v, --verbose', 'Prints latency')
  .option('--json, --raw', 'Prints JSON rather than YAML')
  .action(function (props, cb) {
    const args = props.args ? marshal(props.args) : {}

    console.log(1)

    connection.then(() => {
      const makeRequest = remit
        .request(props.endpoint)
        .options({ timeout: 1000 })
      
        console.log(2)

      const request = pTime(makeRequest)(args)

      return request.then((data) => {
        console.log(3)
  
        console.log('data', data)
        const bg = request.time < 200 ? 'green' : request.time > 500 ? 'red' : 'yellow'
  
        if (props.options.verbose) {
          this.log(pretty(data, props.options.json))      
          this.log(chalk.bold[bg](`took ${request.time}ms`))
        } else {
          this.log(pretty(data, props.options.json))
        }
      })
    })
    .then(cb)
    .catch(e => {
      logErr(e)
      cb()
    })
  })

vorpal
  .command('emit <endpoint> [args...]', 'Emits to a listener')
  .option('--json, --raw', 'Prints JSON rather than YAML')
  .action(function (props, cb) {
    const args = props.args ? marshal(props.args) : {}

    connection
      .then(_ => remit.emit(props.endpoint)(args))
      .then(cb)
      .catch(e => {
        logErr(e)
        cb()
      })
  })

vorpal
  .command('listen <endpoint>', 'Listens for emits')
  .option('--json, --raw', 'Prints JSON rather than YAML')
  .action(function (props, cb) {
    remit
      .listen(props.endpoint)
      .handler(async (data) => {
        this.log(pretty(data, props.options.json), '\n') 
      })
      .start()
   })

if (vorpal.noargs) {
  vorpal.show()
  // checkconnection()
} else {
  // argv is mutated by the first call to parse.
  process.argv.unshift('')
  process.argv.unshift('')

  vorpal
    .on('client_command_executed', function (evt) {
      process.exit(0)
    })
    .parse(process.argv)
}
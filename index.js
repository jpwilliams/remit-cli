#!/usr/bin/env node

const pTime = require('p-time')

const pretty = require('./pretty')
const marshal = require('./marshal')

const vorpal = require('vorpal')()
const chalk = vorpal.chalk

vorpal
  .delimiter(chalk.magenta('remit$'))
  .localStorage('remotes')

const REMIT_HOST = vorpal.localStorage._localStorage.keys[vorpal.localStorage.getItem('default')]
const remit = require('remit')({
  url: REMIT_HOST
})

const logConnectionStatus = (function makeConnectionStatus () {
  remit._connection.then(() => {
    vorpal.log(chalk.green.bold('Successfully connected to RabbitMQ server:', remit._options.url))
  }).catch((e) => {
    vorpal.log(chalk.red.bold('Failed to connect to RabbitMQ server:', remit._options.url, e))
  })
})


vorpal.noargs = vorpal.parse(process.argv, {use: 'minimist'})._ === undefined;

vorpal
  .command('remote <method> [origin] [url]')
  .action(function (props, cb) {
    switch(props.method) {
      case 'default':
        vorpal.localStorage.setItem('default', props.origin)
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
    }

    return cb()
  })

vorpal
  .command('request <endpoint> [args...]')
  .option('-v, --verbose')
  .action(function (props, cb) {
    const args = props.args ? marshal(props.args) : {}

    const makeRequest = remit
      .request(props.endpoint)
      .options({ timeout: 1000 })

    const request = pTime(makeRequest)(args)

    request.then((data) => {
      const bg = request.time < 200 ? 'green' : request.time > 500 ? 'red' : 'yellow'

      if (props.options.verbose) {
        this.log(pretty(data))      
        this.log(chalk.bold[bg](`took ${request.time}ms`))
      } else {
        this.log(pretty(data))
      }

      cb()
    })
    .catch((e) => {
      this.log(chalk.red.bold.underline('Error'), e)
      cb()
    })
  })

vorpal
  .command('emit <endpoint> [args...]')
  .action(function (props, cb) {
    const args = props.args ? marshal(props.args) : {}

    const emit = remit.emit(props.endpoint)(args)

    emit
      .then((data) => {
        this.log(data)
      })
      .catch((err) => {
        this.log(chalk.red.bold.underline('Error'), e)
      })
      .then(cb, cb)
  })

vorpal
  .command('listen <endpoint>')
  .action(function (props, cb) {
    remit
      .listen(props.endpoint)
      .handler(async (data) => {
        this.log(pretty(data), '\n') 
      })
      .start()
   })

if (vorpal.noargs) {
  vorpal.show()
  logConnectionStatus()
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
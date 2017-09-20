const pTime = require('p-time')

const pretty = require('./pretty')
const marshal = require('./marshal')

const vorpal = require('vorpal')()
const chalk = vorpal.chalk

vorpal
  .delimiter(chalk.magenta('remit$'))
  .localStorage('remotes')

const REMIT_HOST = vorpal.localStorage._localStorage.keys[vorpal.localStorage.getItem('default')]
const remit = require('remit')(REMIT_HOST)

remit._connection.then(() => {
  vorpal.log(chalk.green.bold('Successfully connected to RabbitMQ server:', REMIT_HOST))
}).catch((e) => {
  vorpal.log(chalk.red.bold('Failed to connect to RabbitMQ server:', REMIT_HOST, e))
})

this.noargs = vorpal.parse(process.argv, {use: 'minimist'})._ === undefined;

vorpal
  .command('remote <method> [origin] [url]')
  .autocomplete([
    'default',
    'add',
    'remove',
    'flush',
    'peek'
  ])
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

    return this.noargs ? cb() : null
  })

vorpal
  .command('request <endpoint> [args...]')
  .option('-v, --verbose')
  .action(async function (props, cb) {
    const args = props.args ? marshal(props.args) : {}

    const makeRequest = remit
      .request(props.endpoint)
      .options({ timeout: 1000 })

    await makeRequest.ready()

    const request = await pTime(makeRequest)(args).then((data) => {
      const bg = request.time < 200 ? 'green' : request.time > 500 ? 'red' : 'yellow'

      if (props.options.verbose) {
        this.log(pretty(data))      
        this.log(chalk.bold[bg](`took ${request.time}ms`))
      } else {
        this.log(pretty(data))
      }
    })
    .catch((e) => this.log(e))

    this.noargs ? cb() : null
  })

vorpal
  .command('emit <endpoint> [args...]')
  .action(async function (props, cb) {
    const args = props.args ? marshal(props.args) : {}
    
    remit
      .emit(props.endpoint)()
      .then(cb)
      .catch((e) => this.log(e))
  })

  vorpal
  .command('listen <endpoint>')
  .action(function (props, cb) {
    remit
      .listen(props.endpoint)
      .handler((data, cb) => {
        cb()
        this.log(pretty(data)) 
      })
      .start()
   })

if (this.noargs) {
  vorpal.show()
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
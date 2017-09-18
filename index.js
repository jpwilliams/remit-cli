const remit = require('remit')
const pTime = require('p-time')

const pretty = require('./pretty')
const marshal = require('./marshal')

const vorpal = require('vorpal')()
const chalk = vorpal.chalk

vorpal.localStorage('remotes')

  vorpal
  .command('remote <method> [origin] [url]')
  .autocomplete([
    'add',
    'remove',
    'flush',
    'peek'
  ])
  .action(function (props, cb) {
    switch(props.method) {
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

    cb()
  })

  vorpal
  .command('connect [remote]')
  .action(function (props, cb) {
    if (props.remote) {
      let remote = vorpal.localStorage.getItem(props.remote)

      if (remote) {
        remit(remote)
      } else {
        this.log('REMOTE NOT FOUND')      
      }

      return cb()
    }

    this.prompt({
      type: 'list',
      name: 'remote',
      choices: vorpal.localStorage._localStorage.keys,
      message: 'Which remote do you want to connect to?'
    }, (result) => {
      cb()
    })
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
    .catch((e) => this.log(e))
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
  .action(async function (props, cb) {
    console.log('got listen')
    remit
      .listen(props.endpoint)
      .handler((data) => {
        console.log('got msg')
        this.log(pretty(data)) 
      })
      .start()
   })


vorpal
  .delimiter(chalk.magenta('remit~$'))
  .show()

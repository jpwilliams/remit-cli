const remit = require('remit')()
const pTime = require('p-time')

const pretty = require('./pretty')
const marshal = require('./marshal')

const vorpal = require('vorpal')()
const chalk = vorpal.chalk

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

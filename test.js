const remit = require('remit')({
  url: 'amqp://localhost'
})

const user = {
  "results": [
    {
      "gender": "male",
      "name": {
        "title": "mr",
        "first": "romain",
        "last": "hoogmoed"
      },
      "location": {
        "street": "1861 jan pieterszoon coenstraat",
        "city": "maasdriel",
        "state": "zeeland",
        "postcode": 69217
      },
      "email": "romain.hoogmoed@example.com",
      "dob": "1983-07-14 07:29:45",
      "registered": "2010-09-24 02:10:42",
      "phone": "(656)-976-4980",
      "cell": "(065)-247-9303",
      "picture": {
        "large": "https://randomuser.me/api/portraits/men/83.jpg",
        "medium": "https://randomuser.me/api/portraits/med/men/83.jpg",
        "thumbnail": "https://randomuser.me/api/portraits/thumb/men/83.jpg"
      },
      "nat": "NL"
    }
  ]
}

remit
  .endpoint('user.info.fast')
  .handler((args, done) => setTimeout( _ => done(null, user), 100))
  .start()


remit
  .endpoint('user.info.slow')
  .handler((args, done) => setTimeout( _ => done(null, user), 350))
  .start()

remit
  .endpoint('user.info.veryslow')
  .handler((args, done) => setTimeout( _ => done(null, user), 600))
  .start()

remit
  .endpoint('user.info.broken')
  .handler(async _ => { 
    throw new Error('that did not work')
  })
  .start()

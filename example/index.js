const path = require('path')

const { createLogger } = require('winston')

const winstonDevConsole = require('../dist').default

const util = require('util')

let log = createLogger({
  level: 'silly',
})

log = winstonDevConsole.init(log)
log.add(
  winstonDevConsole.transport({
    // Basepath will be removed from the location output
    basePath: path.resolve(__dirname, '..'),
    showTimestamps: false,
    addLineSeparation: true,
  })
)

function someFunction() {
  log.silly('Logging initialized')
  log.debug('Debug an object', { make: 'Ford', model: 'Mustang', year: 1969 })
  log.verbose('Returned value', { value: util.format })
  log.info({ 'omitting the message': 'works as well' })
}

function someOtherFunction() {
  log.info('Information', {
    options: ['Lorem ipsum', 'dolor sit amet'],
    values: ['Donec augue eros, ultrices.'],
  })
  log.warn('Warning')
  log.error(new Error('Unexpected error'))
}

someFunction()
someOtherFunction()

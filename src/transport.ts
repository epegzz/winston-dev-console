import { transports } from 'winston'
import { format } from './format'
import { DevConsoleTransportOptions } from './types'

export function transport(opts?: DevConsoleTransportOptions) {
  return new transports.Console({
    format: format(opts)
  })
}
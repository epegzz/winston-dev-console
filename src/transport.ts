import { transports } from 'winston'
import { ConsoleTransportInstance } from 'winston/lib/winston/transports'

import { format } from './format'
import { DevConsoleTransportOptions } from './types'

export function transport(
  opts?: DevConsoleTransportOptions
): ConsoleTransportInstance {
  return new transports.Console({
    format: format(opts),
  })
}
